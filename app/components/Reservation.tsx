"use client";

import { motion } from "framer-motion";

export default function Reservation() {
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest opacity-70">Date</label>
                            <input
                                type="date"
                                className="w-full bg-transparent border-b border-wood/30 py-2 focus:border-wood outline-none transition-colors uppercase text-wood/80"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest opacity-70">Time</label>
                            <select className="w-full bg-transparent border-b border-wood/30 py-2 focus:border-wood outline-none transition-colors text-wood/80">
                                <option>Select Time</option>
                                <option>10:00</option>
                                <option>11:00</option>
                                <option>12:00</option>
                                <option>13:00</option>
                                <option>14:00</option>
                                <option>15:00</option>
                                <option>16:00</option>
                                <option>17:00</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-8 text-center">
                        <button
                            className="px-12 py-3 bg-wood text-white hover:bg-wood/90 transition-all duration-300 text-xs tracking-widest rounded-sm"
                        >
                            CHECK AVAILABILITY
                        </button>
                    </div>
                </motion.form>
            </div>
        </section>
    );
}
