"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay, isSameWeek, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import AdminCalendar from "../components/admin/AdminCalendar";

// Mock Data
type Reservation = {
    id: number;
    name: string;
    menu: string;
    date: string;
    time: string;
    source: string;
    status: "Pending" | "Confirmed" | "Cancelled";
};

const initialReservations: Reservation[] = [
    { id: 1, name: "山田 花子", menu: "カット & カラー", date: "2024-02-14", time: "10:00", source: "Web", status: "Pending" },
    { id: 2, name: "鈴木 一郎", menu: "パーマ", date: "2024-02-14", time: "14:00", source: "Web", status: "Confirmed" },
    { id: 3, name: "佐藤 健", menu: "カット", date: "2024-02-15", time: "11:00", source: "Phone", status: "Confirmed" },
];

type ViewMode = 'month' | 'week' | 'day';

export default function AdminDashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [passcode, setPasscode] = useState("");
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
    const [showManualModal, setShowManualModal] = useState(false);

    // Calendar & View State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');

    // Login Mock
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode === "0000") {
            setIsLoggedIn(true);
        } else {
            alert("Passcode is 0000");
        }
    };

    // Manual Add Mock
    const handleManualAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const newRes: Reservation = {
            id: reservations.length + 1,
            name: formData.get("name") as string,
            menu: formData.get("menu") as string,
            date: formData.get("date") as string,
            time: formData.get("time") as string,
            source: formData.get("source") as string,
            status: "Confirmed"
        };
        setReservations([newRes, ...reservations]);
        setShowManualModal(false);
    };

    // Filtering Logic
    const getFilteredReservations = () => {
        return reservations.filter(res => {
            const resDate = parseISO(res.date);

            if (viewMode === 'day') {
                return isSameDay(resDate, selectedDate);
            } else if (viewMode === 'week') {
                return isSameWeek(resDate, selectedDate, { locale: ja });
            } else {
                // For Month view, usually we still show the selected day's details below the calendar
                // Or maybe the whole month? User said "Touch calendar to check reservations for IS day".
                // So focusing on Selected Day is safest for Month/Day view.
                // For Week, maybe show whole week? Let's stick to Selected Day details for clarity unless explicit.
                // Actually, let's make Month View show Selected Date's list.
                // Week View showed Selected Date list (and the week bar).
                return isSameDay(resDate, selectedDate);
            }
        }).sort((a, b) => a.time.localeCompare(b.time));
    };

    const filteredReservations = getFilteredReservations();

    // Stats Logic (Based on selected scope)
    const statsDateDisplay = format(selectedDate, "M月d日(E)", { locale: ja });

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#ebe6df]">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-sm shadow-sm text-center space-y-4 w-full max-w-xs">
                    <h1 className="text-xl font-serif text-wood">nua Admin</h1>
                    <input
                        type="password"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="パスコード"
                        className="w-full border border-wood/20 p-2 rounded-sm text-center outline-none focus:border-wood"
                    />
                    <button className="w-full bg-wood text-white py-2 rounded-sm hover:bg-wood/90 transition-colors">ログイン</button>
                    <p className="text-xs text-gray-400">ヒント: 0000</p>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#ebe6df] pb-24">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-wood/10 px-6 py-4 flex justify-between items-center">
                <h1 className="font-serif text-xl text-wood">nua 管理画面</h1>
                <button onClick={() => setIsLoggedIn(false)} className="text-xs text-wood/60 hover:text-wood">ログアウト</button>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">

                {/* Calendar Section */}
                <AdminCalendar
                    reservations={reservations}
                    selectedDate={selectedDate}
                    onSelectDate={(date) => {
                        setSelectedDate(date);
                        // If in month view, maybe stay? Or switch to Day?
                        // User: "Touch to check that day"
                        // I'll keep mode but update selected date.
                    }}
                    viewMode={viewMode}
                    onChangeViewMode={(mode) => {
                        setViewMode(mode);
                        if (mode === 'day') setSelectedDate(new Date()); // Reset to today if clicking 'Today'
                    }}
                />

                {/* Stats & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h2 className="text-wood font-medium text-lg">{statsDateDisplay} の予約</h2>
                        <p className="text-xs text-wood/60">{filteredReservations.length} 件の予約</p>
                    </div>
                    <button
                        onClick={() => setShowManualModal(true)}
                        className="bg-wood text-white px-6 py-3 rounded-sm shadow-sm hover:bg-wood/90 transition-colors flex items-center gap-2 text-sm"
                    >
                        <span>+</span> 予約の手動追加
                    </button>
                </div>

                {/* Reservation List */}
                <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        {filteredReservations.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                この日の予約はありません。
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f9f8f6] text-wood/60 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">ステータス</th>
                                        <th className="px-6 py-3">時間</th>
                                        <th className="px-6 py-3">氏名</th>
                                        <th className="px-6 py-3">メニュー</th>
                                        <th className="px-6 py-3">経路</th>
                                        <th className="px-6 py-3">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-wood/10">
                                    {filteredReservations.map((res) => (
                                        <tr key={res.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-xs text-xs ${res.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {res.status === 'Confirmed' ? '確定' : '未確定'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-wood">
                                                {res.time}
                                            </td>
                                            <td className="px-6 py-4 font-medium">{res.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{res.menu}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">
                                                    {res.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {res.status === "Pending" && (
                                                    <div className="flex gap-2">
                                                        <button className="text-green-600 hover:text-green-800 text-xs border border-green-200 px-2 py-1 rounded-sm">承認</button>
                                                        <button className="text-red-600 hover:text-red-800 text-xs border border-red-200 px-2 py-1 rounded-sm">拒否</button>
                                                    </div>
                                                )}
                                                {res.status === "Confirmed" && (
                                                    <button className="text-gray-400 hover:text-gray-600 text-xs underline">詳細</button>
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

            {/* Manual Entry Modal */}
            <AnimatePresence>
                {showManualModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-md rounded-sm shadow-lg overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-wood/10 flex justify-between items-center">
                                <h3 className="font-serif text-lg text-wood">予約の追加</h3>
                                <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                            </div>
                            <form onSubmit={handleManualAdd} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">経路</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="source" value="Phone" defaultChecked className="accent-wood" />
                                            <span className="text-sm">お電話</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="source" value="Instagram" className="accent-wood" />
                                            <span className="text-sm">Instagram DM</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">お客様名</label>
                                    <input name="name" required className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood" placeholder="山田 太郎" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1">日付</label>
                                        <input type="date" name="date" required className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood" />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1">時間</label>
                                        <input type="time" name="time" required className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">メニュー</label>
                                    <select name="menu" className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood">
                                        <option value="Cut">カット</option>
                                        <option value="Cut & Color">カット & カラー</option>
                                        <option value="Perm">パーマ</option>
                                        <option value="Head Spa">ヘッドスパ</option>
                                        <option value="Other">その他</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowManualModal(false)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-sm hover:bg-gray-50">キャンセル</button>
                                    <button type="submit" className="flex-1 py-2 bg-wood text-white rounded-sm hover:bg-wood/90">追加する</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
