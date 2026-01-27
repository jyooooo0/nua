"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mock data generator based on date
// normally this would fetch from an API
const getMockSlots = (dateString: string) => {
    // Simple hash to make it look deterministic but random per date
    const hash = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const slots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
        "18:00", "18:30", "19:00"
    ];

    return slots.map((time, index) => {
        // Mock logic: different days have different availability
        const randomVal = (hash + index) % 10;
        let status = "circle"; // default open
        if (randomVal > 7) status = "cross"; // 20% full
        else if (randomVal > 5) status = "triangle"; // 20% limited

        return { time, status };
    });
};

export default function Reservation() {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSlots, setCurrentSlots] = useState<{ time: string, status: string }[]>([]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        setSelectedDate(date);
        setSelectedSlot(null);

        if (date) {
            setIsLoading(true);
            // Simulate API Network delay
            setTimeout(() => {
                setCurrentSlots(getMockSlots(date));
                setIsLoading(false);
            }, 600);
        } else {
            setCurrentSlots([]);
        }
    };

    return (
        <section className="w-full py-32 px-6 bg-[#f2efe9] text-wood">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20%" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h3 className="text-3xl font-serif italic mb-4">Reservation</h3>
                    <p className="text-sm tracking-widest opacity-60">ご予約・お問い合わせ</p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-8 bg-white/50 p-8 md:p-12 rounded-sm shadow-sm"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest opacity-70">Name</label>
                            <input
                                type="text"
                                className="w-full bg-transparent border-b border-wood/30 py-2 focus:border-wood outline-none transition-colors placeholder:text-wood/20"
                                placeholder="Yamada Hanako"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest opacity-70">Email</label>
                            <input
                                type="email"
                                className="w-full bg-transparent border-b border-wood/30 py-2 focus:border-wood outline-none transition-colors placeholder:text-wood/20"
                                placeholder="example@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest opacity-70">Menu</label>
                        <select className="w-full bg-transparent border-b border-wood/30 py-2 focus:border-wood outline-none transition-colors text-wood/80">
                            <option>Select Menu</option>
                            <option>Cut</option>
                            <option>Color</option>
                            <option>Perm</option>
                            <option>Treatment</option>
                            <option>Head Spa</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest opacity-70">Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="w-full bg-transparent border-b border-wood/30 py-2 focus:border-wood outline-none transition-colors uppercase text-wood/80 cursor-pointer"
                            />
                        </div>

                        <div className="space-y-2 min-h-[120px]">
                            <label className="text-xs uppercase tracking-widest opacity-70">Time & Availability</label>

                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-8 flex justify-center text-wood/50"
                                    >
                                        <span className="text-xs tracking-widest animate-pulse">Checking Availability...</span>
                                    </motion.div>
                                ) : selectedDate ? (
                                    <motion.div
                                        key="slots"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 pt-2">
                                            {currentSlots.map((slot) => {
                                                const isSelected = selectedSlot === slot.time;
                                                const isFull = slot.status === "cross";

                                                return (
                                                    <button
                                                        key={slot.time}
                                                        type="button"
                                                        onClick={() => !isFull && setSelectedSlot(slot.time)}
                                                        disabled={isFull}
                                                        className={`
                                                            flex flex-col items-center justify-center py-3 rounded-sm border transition-all duration-300
                                                            ${isSelected
                                                                ? 'bg-wood text-white border-wood'
                                                                : isFull
                                                                    ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed'
                                                                    : 'bg-white/40 border-wood/10 hover:border-wood/40 hover:bg-white/80 text-wood'}
                                                        `}
                                                    >
                                                        <span className="text-sm font-serif">{slot.time}</span>
                                                        <span className="text-xs mt-1">
                                                            {slot.status === "circle" ? "◎" : slot.status === "triangle" ? "△" : "×"}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-end gap-4 text-xs opacity-60 pt-2">
                                            <span>◎ : Available</span>
                                            <span>△ : Limited</span>
                                            <span>× : Full</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-8 text-center text-wood/40 text-sm italic"
                                    >
                                        Please select a date first.
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="pt-8 text-center">
                        <button
                            className="px-12 py-3 bg-wood text-white hover:bg-wood/90 transition-all duration-300 text-xs tracking-widest rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedSlot}
                        >
                            CHECK AVAILABILITY
                        </button>
                    </div>
                </motion.form>
            </div>
        </section>
    );
}
