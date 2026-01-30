"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay, isSameWeek, parseISO, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import AdminCalendar from "../components/admin/AdminCalendar";
import AuthGuard from "../components/AuthGuard";
import CustomerAutocomplete from "../components/CustomerAutocomplete";
import Link from "next/link";
import { Customer, Booking, Menu, Profile } from "@/app/lib/types"; // Using V2 types
import { supabase } from "@/app/lib/supabaseClient";
import { getMenus, getAvailableSlots, calculateEndTime, ALL_SLOTS } from "@/app/lib/bookingLogic";
import { sendConfirmationEmail, sendCancellationEmail, EMAIL_ENABLED, sendAlternativeDateEmail } from "@/app/lib/emailService";
import EmailPreviewModal from "../components/admin/EmailPreviewModal";

type ViewMode = 'month' | 'week' | 'day';

type AlternativeDate = {
    date: string;
    time: string;
};

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [showManualModal, setShowManualModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);

    // Rejection with alternative date modal
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
    const [alternativeDates, setAlternativeDates] = useState<AlternativeDate[]>([
        { date: "", time: "" },
        { date: "", time: "" },
        { date: "", time: "" }
    ]);
    const [availableSlotsMap, setAvailableSlotsMap] = useState<{ [key: number]: string[] }>({
        0: [], 1: [], 2: []
    });

    // Calendar & View State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');

    // Email Preview Modal State
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailType, setEmailType] = useState<"confirmation" | "cancellation" | "resuggestion">("confirmation");
    const [processingBooking, setProcessingBooking] = useState<Booking | null>(null);

    // Initial Fetch
    useEffect(() => {
        const initData = async () => {
            setLoading(true);

            // Fetch Menus
            const menuData = await getMenus();
            setMenus(menuData);

            // Fetch Bookings
            await fetchBookings();

            setLoading(false);
        };

        initData();

        // Subscribe to real-time updates on 'bookings' table
        const subscription = supabase
            .channel('bookings_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                fetchBookings();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchBookings = async () => {
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .order("date", { ascending: true })
            .order("start_time", { ascending: true });

        if (error) {
            console.error("Error fetching bookings:", error);
        } else {
            setBookings(data || []);
        }
    };

    // Fetch available slots for a specific alternative date index
    const fetchAlternativesSlot = async (index: number, date: string) => {
        if (!date || !rejectingBooking) {
            setAvailableSlotsMap(prev => ({ ...prev, [index]: [] }));
            return;
        }

        // Find associated menu duration (approximation if menu deleted)
        // Ideally we fetch menu by ID, but falling back to menu_name matching or default 60
        // Currently 'bookings' has menu_id, so let's try to find it in 'menus' state
        const menu = menus.find(m => m.id === rejectingBooking.menu_id) || menus.find(m => m.name === rejectingBooking.menu_name);
        const duration = menu ? menu.duration : 60;

        const slots = await getAvailableSlots(date, duration);
        setAvailableSlotsMap(prev => ({ ...prev, [index]: slots }));
    };

    // Update alternative date and fetch slots
    const handleAlternativeDateChange = (index: number, date: string) => {
        const newDates = [...alternativeDates];
        newDates[index] = { ...newDates[index], date, time: "" }; // Reset time
        setAlternativeDates(newDates);
        fetchAlternativesSlot(index, date);
    };

    const handleAlternativeTimeChange = (index: number, time: string) => {
        const newDates = [...alternativeDates];
        newDates[index] = { ...newDates[index], time };
        setAlternativeDates(newDates);
    };

    // Manual Add Handler
    const handleManualAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) {
            alert("お客様を選択または新規登録してください");
            return;
        }
        const formData = new FormData(e.target as HTMLFormElement);
        const menuId = formData.get("menu") as string;
        const startTime = formData.get("time") as string;
        const date = formData.get("date") as string;

        const selectedMenu = menus.find(m => m.id === menuId);
        if (!selectedMenu) return;

        const endTime = calculateEndTime(startTime, selectedMenu.duration);

        const { error } = await supabase
            .from("bookings")
            .insert([{
                customer_id: selectedCustomer.id,
                customer_name: selectedCustomer.name,
                customer_email: selectedCustomer.email || null,
                menu_id: selectedMenu.id,
                menu_name: selectedMenu.name,
                menu_price: selectedMenu.price,
                date: date,
                start_time: startTime,
                end_time: endTime,
                status: "confirmed" // Admin created are confirmed by default
            }]);

        if (error) {
            alert("予約の追加に失敗しました: " + error.message);
        } else {
            setShowManualModal(false);
            setSelectedCustomer(null);
            // fetchBookings handled by realtime
        }
    };

    // Handle Confirm Click -> Open Email Preview
    const handleConfirmClick = (booking: Booking) => {
        setProcessingBooking(booking);
        setEmailType("confirmation");
        setShowEmailModal(true);
    };

    // Update status directly (Called after email modal confirmation)
    const updateStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from("bookings")
            .update({ status })
            .eq("id", id);

        if (error) {
            alert("ステータスの更新に失敗しました: " + error.message);
            return;
        }
        // No alert here to avoid double alerts, visual feedback via UI update is enough or handled by modal
    };

    // Open rejection modal
    const openRejectModal = (booking: Booking) => {
        setRejectingBooking(booking);
        // Default tomorrow
        const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

        setAlternativeDates([
            { date: tomorrow, time: "" },
            { date: "", time: "" },
            { date: "", time: "" }
        ]);

        // Need to set state first before fetching slots for it, 
        // but here we know the booking so we can fetch directly.
        // However, 'fetchAlternativesSlot' relies on 'rejectingBooking' state which might not be set yet if batched?
        // Let's use local var
        setTimeout(() => {
            // quick hack to ensure state is set, or better pass booking explicitly.
            // For now just manually calling getAvailableSlots logic is safer without relying on state inside function immediately 
        }, 0);

        // Actually better: just set modal true, and let user change date to trigger fetch, 
        // OR fetch manually for the default tomorrow date using the current booking info
        const menuId = booking.menu_id;
        const menu = menus.find(m => m.id === menuId) || menus.find(m => m.name === booking.menu_name);
        const duration = menu ? menu.duration : 60;

        getAvailableSlots(tomorrow, duration).then(slots => {
            setAvailableSlotsMap({ 0: slots, 1: [], 2: [] });
        });

        setShowRejectModal(true);
    };

    // Handle "Execute" from Reject/Resuggest Modal -> Open Email Preview
    const handleRejectWithAlternative = () => {
        if (!rejectingBooking) return;

        const validAlternatives = alternativeDates.filter(alt => alt.date && alt.time);

        // Determine type based on alternatives
        const type = validAlternatives.length > 0 ? "resuggestion" : "cancellation";

        // Close reject modal first
        setShowRejectModal(false);

        // Open Email Preview
        setProcessingBooking(rejectingBooking);
        setEmailType(type);
        setShowEmailModal(true);
    };

    // Callback when Email Modal is confirmed
    const handleEmailConfirmed = async () => {
        if (!processingBooking) return;

        let newStatus = "";
        if (emailType === "confirmation") newStatus = "confirmed";
        else if (emailType === "resuggestion") newStatus = "resuggesting";
        else if (emailType === "cancellation") newStatus = "cancelled";

        await updateStatus(processingBooking.id, newStatus);

        // Cleanup
        setProcessingBooking(null);
        setRejectingBooking(null);
    };

    // Filter for view
    const filteredBookings = bookings.filter(res => {
        const resDate = parseISO(res.date);
        if (viewMode === 'day') return isSameDay(resDate, selectedDate);
        if (viewMode === 'week') return isSameWeek(resDate, selectedDate, { locale: ja });
        return isSameDay(resDate, selectedDate);
    }).sort((a, b) => a.start_time.localeCompare(b.start_time));

    const statsDateDisplay = format(selectedDate, "M月d日(E)", { locale: ja });

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#ebe6df]">
                <header className="bg-white border-b border-wood/10 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-xl text-wood">nua 管理画面</h1>
                        <p className="text-xs text-gray-400">Admin Dashboard (V2.0)</p>
                    </div>
                    <nav className="flex gap-4 text-sm">
                        <Link href="/admin" className="text-wood hover:underline font-medium">ダッシュボード</Link>
                        <Link href="/admin/customers" className="text-gray-500 hover:text-wood hover:underline">顧客管理</Link>
                        <Link href="/admin/settings/menus" className="text-gray-500 hover:text-wood hover:underline">メニュー設定</Link>
                    </nav>
                </header>

                <main className="p-6 space-y-6 max-w-6xl mx-auto">
                    {/* Calendar */}
                    <AdminCalendar
                        selectedDate={selectedDate}
                        reservations={filteredBookings.map(r => ({
                            id: r.id,
                            name: r.customer_name,
                            menu: r.menu_name,
                            date: r.date,
                            time: r.start_time,
                            source: "Web",
                            status: r.status === 'confirmed' ? 'Confirmed' : 'Pending' // Simple mapping for calendar
                        }))}
                        onSelectDate={setSelectedDate}
                        viewMode={viewMode}
                        onChangeViewMode={setViewMode}
                    />

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                        <div>
                            <h2 className="text-wood font-medium text-lg">{statsDateDisplay} の予約</h2>
                            <p className="text-xs text-wood/60">{loading ? "Loading..." : `${filteredBookings.length} 件`}</p>
                        </div>
                        <button onClick={() => setShowManualModal(true)} className="bg-wood text-white px-6 py-3 rounded-sm shadow-sm hover:bg-wood/90 transition-colors flex items-center gap-2 text-sm">
                            <span>+</span> 予約の手動追加
                        </button>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            {filteredBookings.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">予約はありません。</div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[#f9f8f6] text-wood/60 uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-3">ステータス</th>
                                            <th className="px-6 py-3">時間</th>
                                            <th className="px-6 py-3">氏名</th>
                                            <th className="px-6 py-3">メニュー</th>
                                            <th className="px-6 py-3">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-wood/10">
                                        {filteredBookings.map((res) => (
                                            <tr key={res.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-xs text-xs ${res.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        res.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            res.status === 'resuggesting' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {res.status === 'confirmed' ? '予約済み' :
                                                            res.status === 'cancelled' ? 'キャンセル' :
                                                                res.status === 'resuggesting' ? '再提案中' :
                                                                    res.status === 'pending' ? '仮予約' : res.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-wood">
                                                    {res.start_time.slice(0, 5)} - {res.end_time.slice(0, 5)}
                                                </td>
                                                <td className="px-6 py-4 font-medium">
                                                    {res.customer_id ? (
                                                        <Link href={`/admin/customers/${res.customer_id}`} className="text-wood hover:underline">
                                                            {res.customer_name}
                                                        </Link>
                                                    ) : (
                                                        <span>{res.customer_name}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{res.menu_name}</td>
                                                <td className="px-6 py-4">
                                                    {(res.status === "pending" || res.status === "resuggesting") && (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleConfirmClick(res)} className="text-green-600 border border-green-200 px-3 py-1 rounded-sm hover:bg-green-50">承認</button>
                                                            <button onClick={() => openRejectModal(res)} className="text-red-600 border border-red-200 px-3 py-1 rounded-sm hover:bg-red-50">拒否/提案</button>
                                                        </div>
                                                    )}
                                                    {res.status === "confirmed" && (
                                                        <button onClick={() => openRejectModal(res)} className="text-gray-500 border border-gray-200 px-3 py-1 rounded-sm hover:bg-gray-50">変更</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>

                {/* Manual Modal */}
                <AnimatePresence>
                    {showManualModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div className="bg-white w-full max-w-md rounded-sm shadow-lg overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="px-6 py-4 border-b flex justify-between items-center">
                                    <h3 className="text-lg text-wood">予約追加</h3>
                                    <button onClick={() => setShowManualModal(false)}>×</button>
                                </div>
                                <form onSubmit={handleManualAdd} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">顧客</label>
                                        <CustomerAutocomplete onSelect={setSelectedCustomer} placeholder="名前検索..." />
                                        {selectedCustomer && <p className="text-xs text-green-600 mt-1">✓ {selectedCustomer.name}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">日付</label>
                                            <input type="date" name="date" required className="w-full border p-2 rounded-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">時間</label>
                                            <select name="time" required className="w-full border p-2 rounded-sm">
                                                <option value="">選択</option>
                                                {ALL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">メニュー</label>
                                        <select name="menu" required className="w-full border p-2 rounded-sm">
                                            {menus.map(m => (
                                                <option key={m.id} value={m.id}>{m.name} ({m.duration}分 - ¥{m.price})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full bg-wood text-white py-2 rounded-sm">追加</button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Reject Modal */}
                <AnimatePresence>
                    {showRejectModal && rejectingBooking && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div className="bg-white w-full max-w-md rounded-sm shadow-lg overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="px-6 py-4 border-b bg-red-50 flex justify-between items-center">
                                    <h3 className="text-lg text-red-700">お断り・別日提案</h3>
                                    <button onClick={() => setShowRejectModal(false)}>×</button>
                                </div>
                                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                    <div className="bg-gray-50 p-4 rounded-sm">
                                        <p className="font-medium">{rejectingBooking.customer_name}</p>
                                        <p className="text-sm text-gray-600">{rejectingBooking.date} {rejectingBooking.start_time} - {rejectingBooking.menu_name}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs text-gray-500">別日提案 (3つまで)</p>
                                        {[0, 1, 2].map((idx) => (
                                            <div key={idx} className="bg-gray-50 p-2 rounded-sm border">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="date"
                                                        value={alternativeDates[idx].date}
                                                        onChange={e => handleAlternativeDateChange(idx, e.target.value)}
                                                        className="border p-1 text-sm"
                                                    />
                                                    <select
                                                        value={alternativeDates[idx].time}
                                                        onChange={e => handleAlternativeTimeChange(idx, e.target.value)}
                                                        className="border p-1 text-sm"
                                                        disabled={!alternativeDates[idx].date}
                                                    >
                                                        <option value="">時間</option>
                                                        {availableSlotsMap[idx]?.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={() => setShowRejectModal(false)} className="flex-1 border py-2 text-gray-600">戻る</button>
                                        <button onClick={handleRejectWithAlternative} className="flex-1 bg-red-600 text-white py-2">次へ (メール作成)</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Email Preview Modal */}
                {/* Always rendered but controlled by internal state, 
                    OR conditionally rendered. Conditional is better for init logic in useEffect of child */}
                {showEmailModal && processingBooking && (
                    <EmailPreviewModal
                        isOpen={showEmailModal}
                        onClose={() => setShowEmailModal(false)}
                        onConfirm={handleEmailConfirmed}
                        booking={processingBooking}
                        type={emailType}
                        alternativeDates={alternativeDates.filter(d => d.date && d.time)}
                    />
                )}
            </div>
        </AuthGuard>
    );
}
