"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import { supabase } from "../lib/supabaseClient";
import { Menu } from "../lib/types"; // V2 types
import { getMenus, getAvailableSlots, calculateEndTime } from "../lib/bookingLogic";
import { sendBookingRequestEmail, EMAIL_ENABLED } from "../lib/emailService";

export default function Reservation() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [menus, setMenus] = useState<Menu[]>([]);

    // Form State
    const [selectedMenuId, setSelectedMenuId] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);

    // Add-on Options State
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

    // Logic State
    const [isNewCustomer, setIsNewCustomer] = useState(false);

    // Customer Info
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [conversationStyle, setConversationStyle] = useState("unspecified");

    // Separate main menus from add-ons
    const mainMenus = menus.filter(m => !m.name.includes("（Set）"));
    const addOnMenus = menus.filter(m => m.name.includes("（Set）"));

    // Initial Fetch
    useEffect(() => {
        const init = async () => {
            const menuData = await getMenus();
            if (menuData) setMenus(menuData);
        };
        init();
    }, []);

    // Fetch Slots when Date or Menu changes
    useEffect(() => {
        const fetchSlots = async () => {
            if (selectedDate && selectedMenuId) {
                setLoading(true);
                const menu = menus.find(m => m.id === selectedMenuId);
                if (menu) {
                    // Start available slots check with appropriate buffer
                    // New customer = 60 mins buffer, Existing = 30 mins (default)
                    const buffer = isNewCustomer ? 60 : 30;
                    const slots = await getAvailableSlots(selectedDate, menu.duration, buffer);
                    setAvailableSlots(slots);
                }
                setLoading(false);
            }
        };
        fetchSlots();
    }, [selectedDate, selectedMenuId, menus, isNewCustomer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const menu = menus.find(m => m.id === selectedMenuId);
        if (!menu) return;

        // Calculate total duration including add-ons
        const addOnDuration = selectedAddons.reduce((sum, addonId) => {
            const addon = menus.find(m => m.id === addonId);
            return sum + (addon?.duration || 0);
        }, 0);
        const totalDuration = menu.duration + addOnDuration;
        const endTime = calculateEndTime(selectedTime, totalDuration);

        // Build add-on names for notes
        const addonNames = selectedAddons.map(addonId => {
            const addon = menus.find(m => m.id === addonId);
            return addon?.name || "";
        }).filter(Boolean);
        const addonText = addonNames.length > 0 ? `[オプション: ${addonNames.join(", ")}]\n` : "";

        // Save to 'bookings' table (V2 Schema)
        const { error } = await supabase
            .from("bookings")
            .insert([{
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                menu_id: menu.id,
                menu_name: menu.name,
                menu_price: menu.price,
                date: selectedDate,
                start_time: selectedTime,
                end_time: endTime,
                status: "pending",
                staff_notes: `[新規: ${isNewCustomer ? "Yes" : "No"}]\n[スタイル: ${conversationStyle === "quiet" ? "静かに過ごしたい" : conversationStyle === "chat" ? "会話を楽しみたい" : "指定なし"}]\n${addonText}${notes}`
            }]);

        if (error) {
            alert("予約エラー: " + error.message);
            setLoading(false);
            return;
        }

        // Send Email
        await sendBookingRequestEmail({
            customerName: name,
            customerEmail: email,
            date: selectedDate,
            startTime: selectedTime,
            endTime: endTime,
            menu: menu.name
        });

        if (EMAIL_ENABLED) {
            console.log("Email sent request triggered");
        }

        setLoading(false);
        setStep(3); // Completion
    };

    const resetForm = () => {
        setStep(1);
        setSelectedMenuId("");
        setSelectedDate("");
        setSelectedTime("");
        setName("");
        setEmail("");
        setPhone("");
        setNotes("");
        setIsNewCustomer(false);
        setConversationStyle("unspecified");
        setSelectedAddons([]);
        setIsModalOpen(false);
    };

    // Helper to get next 14 days
    const dates = Array.from({ length: 14 }).map((_, i) => {
        const d = addDays(new Date(), i + 1); // Start from tomorrow
        return {
            value: format(d, "yyyy-MM-dd"),
            label: format(d, "M/d(E)", { locale: ja }),
        };
    });

    return (
        <>
            {/* Reservation Section */}
            <section className="w-full py-32 px-6 bg-[#2a2826] text-center">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-20%" }}
                        transition={{ duration: 0.8 }}
                        className="mb-12"
                    >
                        <h3 className="text-3xl font-serif text-[#e8e6e3] italic mb-4">Reservation</h3>
                        <p className="text-sm text-[#e8e6e3]/60 tracking-widest">ご予約</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <p className="text-[#e8e6e3]/70 text-sm leading-relaxed">
                            ご予約は下記ボタンからお願いいたします。<br />
                            24時間いつでもご予約いただけます。
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#e8e6e3] text-[#2a2826] px-10 py-4 rounded-sm text-lg font-serif tracking-wider hover:bg-[#e8e6e3]/90 transition-colors shadow-lg"
                        >
                            RESERVATION
                        </motion.button>
                        <p className="text-[#e8e6e3]/50 text-xs mt-4">
                            ※お電話でのご予約も承っております
                        </p>
                    </motion.div>
                </div>
            </section>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#f9f8f6] w-full max-w-lg rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-wood/10 flex justify-between items-center bg-white">
                                <div>
                                    <h2 className="text-2xl font-serif text-wood">Reservation</h2>
                                    <p className="text-xs text-gray-400 mt-1">ご予約</p>
                                </div>
                                <button
                                    onClick={resetForm}
                                    className="text-gray-400 hover:text-wood transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                {step === 1 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        {/* Menu Selection */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-bold text-wood uppercase tracking-widest border-b border-wood/20 pb-2">01. メニュー選択</h3>

                                            {/* Group menus by category */}
                                            {(() => {
                                                // Define category order and labels
                                                const categoryOrder = [
                                                    { key: "cut", label: "カット", labelEn: "CUT" },
                                                    { key: "color", label: "カラー", labelEn: "COLOR" },
                                                    { key: "cut_color", label: "カット + カラー", labelEn: "CUT + COLOR" },
                                                    { key: "perm", label: "パーマ", labelEn: "PERM" },
                                                    { key: "treatment", label: "トリートメント", labelEn: "TREATMENT" },
                                                    { key: "headspa", label: "ヘッドスパ", labelEn: "HEAD SPA" },
                                                    { key: "other", label: "その他", labelEn: "OTHER" },
                                                ];

                                                // Group menus by display_order ranges or name patterns
                                                const groupMenus = (menus: Menu[]) => {
                                                    const groups: Record<string, Menu[]> = {};
                                                    categoryOrder.forEach(cat => groups[cat.key] = []);

                                                    menus.forEach(menu => {
                                                        const name = menu.name.toLowerCase();
                                                        if (name.includes("カット") && name.includes("カラー")) {
                                                            groups["cut_color"].push(menu);
                                                        } else if (name.includes("カット") || name.includes("cut")) {
                                                            groups["cut"].push(menu);
                                                        } else if (name.includes("カラー") || name.includes("リタッチ") || name.includes("ブリーチ") || name.includes("デザインカラー")) {
                                                            groups["color"].push(menu);
                                                        } else if (name.includes("パーマ") || name.includes("縮毛") || name.includes("ストレート")) {
                                                            groups["perm"].push(menu);
                                                        } else if (name.includes("トリートメント")) {
                                                            groups["treatment"].push(menu);
                                                        } else if (name.includes("スパ") || name.includes("ヘッドスパ")) {
                                                            groups["headspa"].push(menu);
                                                        } else {
                                                            groups["other"].push(menu);
                                                        }
                                                    });
                                                    return groups;
                                                };

                                                const groupedMenus = groupMenus(mainMenus);

                                                return (
                                                    <div className="space-y-4">
                                                        {categoryOrder.map(cat => {
                                                            const items = groupedMenus[cat.key];
                                                            if (items.length === 0) return null;

                                                            const isSelectedInCategory = items.some(m => m.id === selectedMenuId);

                                                            return (
                                                                <details
                                                                    key={cat.key}
                                                                    className="group border border-gray-200 rounded-sm overflow-hidden"
                                                                    open={isSelectedInCategory}
                                                                >
                                                                    <summary className={`flex justify-between items-center p-3 cursor-pointer transition-colors ${isSelectedInCategory ? "bg-wood/10" : "bg-gray-50 hover:bg-gray-100"}`}>
                                                                        <div className="flex items-baseline gap-2">
                                                                            <span className="font-medium text-wood">{cat.labelEn}</span>
                                                                            <span className="text-xs text-gray-500">{cat.label}</span>
                                                                        </div>
                                                                        <span className="text-xs text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                                                                    </summary>
                                                                    <div className="p-2 space-y-2 bg-white">
                                                                        {items.map((menu) => (
                                                                            <button
                                                                                key={menu.id}
                                                                                onClick={() => setSelectedMenuId(menu.id)}
                                                                                className={`w-full text-left p-3 rounded-sm border transition-all ${selectedMenuId === menu.id
                                                                                    ? "border-wood bg-wood text-white shadow-md"
                                                                                    : "border-gray-100 bg-gray-50 hover:border-wood/50 hover:bg-white text-gray-600"
                                                                                    }`}
                                                                            >
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="font-medium">{menu.name}</span>
                                                                                    <span className="text-sm opacity-80">¥{menu.price.toLocaleString()}</span>
                                                                                </div>
                                                                                <p className="text-xs mt-1 opacity-70">{menu.duration}分</p>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </details>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Add-on Options */}
                                        {selectedMenuId && addOnMenus.length > 0 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                                <h3 className="text-sm font-bold text-wood uppercase tracking-widest border-b border-wood/20 pb-2">追加オプション</h3>
                                                <p className="text-xs text-wood/60">※ご希望の方はお選びください</p>
                                                <div className="space-y-2">
                                                    {addOnMenus.map((addon) => (
                                                        <label key={addon.id} className="flex items-center gap-3 p-3 bg-white rounded-sm border border-wood/10 cursor-pointer hover:border-wood/30 transition-colors">
                                                            <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-colors ${selectedAddons.includes(addon.id) ? "bg-wood border-wood" : "bg-white border-gray-300"}`}>
                                                                {selectedAddons.includes(addon.id) && <span className="text-white text-xs">✓</span>}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={selectedAddons.includes(addon.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedAddons([...selectedAddons, addon.id]);
                                                                    } else {
                                                                        setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                                                                    }
                                                                }}
                                                            />
                                                            <div className="flex-1">
                                                                <span className="text-sm text-wood font-medium">{addon.name}</span>
                                                                <span className="text-xs text-wood/60 ml-2">+{addon.duration}分</span>
                                                            </div>
                                                            <span className="text-sm text-wood">¥{addon.price.toLocaleString()}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Date & Time Selection */}
                                        {selectedMenuId && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                                <h3 className="text-sm font-bold text-wood uppercase tracking-widest border-b border-wood/20 pb-2">02. 日時選択</h3>

                                                {/* New Customer Checkbox */}
                                                <div className="bg-orange-50/50 p-4 rounded-sm border border-orange-100">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-colors ${isNewCustomer ? "bg-wood border-wood" : "bg-white border-gray-300 group-hover:border-wood"}`}>
                                                            {isNewCustomer && <span className="text-white text-xs">✓</span>}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={isNewCustomer}
                                                            onChange={(e) => setIsNewCustomer(e.target.checked)}
                                                        />
                                                        <span className="text-sm text-wood font-medium">初めてのご来店ですか？</span>
                                                    </label>
                                                    <p className="text-xs text-gray-500 mt-2 ml-8">
                                                        ※初めてご来店のお客様は、カウンセリング時間を多めに確保するため、<br />
                                                        通常より長めのお時間をいただいております。
                                                    </p>
                                                </div>

                                                {/* Date Selection - Button Grid */}
                                                <div className="space-y-2">
                                                    <label className="block text-xs text-gray-400">日付</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {dates.map((d) => (
                                                            <button
                                                                key={d.value}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedDate(d.value);
                                                                    setSelectedTime("");
                                                                }}
                                                                className={`px-3 py-2 text-sm rounded-sm border transition-all ${selectedDate === d.value
                                                                    ? "bg-wood text-white border-wood"
                                                                    : "bg-white text-gray-700 border-gray-200 hover:border-wood"
                                                                    }`}
                                                            >
                                                                {d.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Time Selection - Button Grid */}
                                                {selectedDate && (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <label className="block text-xs text-gray-400">ご希望の時間を選択</label>
                                                            <div className="flex gap-3 text-xs text-gray-400">
                                                                <span className="flex items-center gap-1">
                                                                    <span className="w-3 h-3 border border-green-400 rounded-sm bg-white"></span>
                                                                    空き
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <span className="w-3 h-3 bg-red-100 rounded-sm"></span>
                                                                    予約済
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {loading ? (
                                                            <div className="text-center py-8 text-gray-400">確認中...</div>
                                                        ) : (
                                                            <>
                                                                <div className="grid grid-cols-5 gap-2">
                                                                    {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
                                                                        "12:30", "13:00", "13:30", "14:00", "14:30",
                                                                        "15:00", "15:30", "16:00", "16:30", "17:00",
                                                                        "17:30"].map((slot) => {
                                                                            const isAvailable = availableSlots.includes(slot);
                                                                            const isSelected = selectedTime === slot;
                                                                            return (
                                                                                <button
                                                                                    key={slot}
                                                                                    type="button"
                                                                                    disabled={!isAvailable}
                                                                                    onClick={() => setSelectedTime(slot)}
                                                                                    className={`py-3 text-sm rounded-sm border transition-all flex flex-col items-center justify-center ${isSelected
                                                                                        ? "bg-wood text-white border-wood"
                                                                                        : isAvailable
                                                                                            ? "bg-white text-gray-700 border-gray-200 hover:border-wood"
                                                                                            : "bg-red-50 text-red-300 border-red-100 cursor-not-allowed"
                                                                                        }`}
                                                                                >
                                                                                    <span className="font-medium">{slot}</span>
                                                                                    {isAvailable && !isSelected && (
                                                                                        <span className="text-green-500 text-xs">○</span>
                                                                                    )}
                                                                                    {!isAvailable && (
                                                                                        <span className="text-red-300 text-xs">×</span>
                                                                                    )}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                </div>
                                                                <p className="text-center text-xs text-gray-400 mt-2">
                                                                    {availableSlots.length}件の空きがあります
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        <button
                                            onClick={() => setStep(2)}
                                            disabled={!selectedMenuId || !selectedDate || !selectedTime}
                                            className="w-full bg-wood text-white py-4 mt-4 rounded-sm font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-wood/90 transition-all shadow-md"
                                        >
                                            次へ進む
                                        </button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <h3 className="text-sm font-bold text-wood uppercase tracking-widest border-b border-wood/20 pb-2">03. お客様情報</h3>

                                        <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm text-sm space-y-2">
                                            <p><span className="text-gray-400 w-20 inline-block">日時</span> <span className="text-wood font-medium">{selectedDate} {selectedTime}</span></p>
                                            <p><span className="text-gray-400 w-20 inline-block">メニュー</span> <span className="text-wood font-medium">{menus.find(m => m.id === selectedMenuId)?.name}</span></p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">お名前 *</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full p-3 border border-gray-200 rounded-sm focus:border-wood outline-none"
                                                    placeholder="山田 花子"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">メールアドレス *</label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full p-3 border border-gray-200 rounded-sm focus:border-wood outline-none"
                                                    placeholder="example@email.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">電話番号 *</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full p-3 border border-gray-200 rounded-sm focus:border-wood outline-none"
                                                    placeholder="090-1234-5678"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-400 mb-2">ご希望の接客スタイル</label>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-sm p-3 flex-1 hover:border-wood/50 transition-colors has-[:checked]:border-wood has-[:checked]:bg-wood/5">
                                                        <input
                                                            type="radio"
                                                            name="style"
                                                            value="chat"
                                                            checked={conversationStyle === "chat"}
                                                            onChange={(e) => setConversationStyle(e.target.value)}
                                                            className="accent-wood"
                                                        />
                                                        <span className="text-sm text-gray-600">会話を楽しみたい</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-sm p-3 flex-1 hover:border-wood/50 transition-colors has-[:checked]:border-wood has-[:checked]:bg-wood/5">
                                                        <input
                                                            type="radio"
                                                            name="style"
                                                            value="quiet"
                                                            checked={conversationStyle === "quiet"}
                                                            onChange={(e) => setConversationStyle(e.target.value)}
                                                            className="accent-wood"
                                                        />
                                                        <span className="text-sm text-gray-600">静かに過ごしたい</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">ご要望など</label>
                                                <textarea
                                                    rows={3}
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    className="w-full p-3 border border-gray-200 rounded-sm focus:border-wood outline-none"
                                                    placeholder="ご質問などあればご記入ください"
                                                />
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep(1)}
                                                    className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-sm hover:bg-gray-50 transition-colors"
                                                >
                                                    戻る
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex-1 py-3 bg-wood text-white rounded-sm hover:bg-wood/90 transition-colors shadow-md disabled:bg-gray-300"
                                                >
                                                    {loading ? "送信中..." : "予約を確定する"}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-6">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                                            ✓
                                        </div>
                                        <h3 className="text-xl font-serif text-wood">予約リクエスト完了</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            ご予約ありがとうございます。<br />
                                            確認メールをお送りしました。<br />
                                            お店からの確定連絡をお待ちください。
                                        </p>
                                        <button
                                            onClick={resetForm}
                                            className="inline-block mt-4 text-wood border-b border-wood hover:opacity-70 transition-opacity"
                                        >
                                            閉じる
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
