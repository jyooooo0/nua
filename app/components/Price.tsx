"use client";

import { motion } from "framer-motion";

const menuItems = [
    { name: "Cut", price: "¥ -" },
    { name: "Color", price: "¥ -" },
    { name: "Perm", price: "¥ -" },
    { name: "Treatment", price: "¥ -" },
    { name: "Head Spa", price: "¥ -" },
    { name: "Other", price: "¥ -" },
];

export default function Price() {
    return (
        <section className="w-full py-32 px-6 bg-[#F8F6F4] text-center">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20%" }}
                    transition={{ duration: 0.8 }}
                    className="mb-16"
                >
                    <h3 className="text-3xl font-serif text-wood italic mb-4">Price</h3>
                    <p className="text-sm text-wood/60 tracking-widest">MENU LIST</p>
                </motion.div>

                <div className="grid grid-cols-1 gap-8">
                    {menuItems.map((item, index) => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex justify-between items-end border-b border-wood/20 pb-2 mx-4 md:mx-12"
                        >
                            <span className="font-serif text-lg md:text-xl text-wood tracking-wide">{item.name}</span>
                            <span className="font-light text-wood/80 tracking-widest">{item.price}</span>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="mt-16 text-xs text-wood/50 leading-loose"
                >
                    ※金額は全て税込表示となります。<br />
                    詳細はカウンセリング時にご案内いたします。
                </motion.p>
            </div>
        </section>
    );
}
