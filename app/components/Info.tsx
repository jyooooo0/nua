"use client";

import { motion } from "framer-motion";

export default function Info() {
    return (
        <section className="w-full py-24 bg-[#f2efe9] text-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="flex flex-col items-center gap-8"
            >
                <h3 className="text-2xl font-serif text-wood italic">Information</h3>

                <div className="space-y-2 text-foreground/80">
                    <p className="text-lg font-medium">nua</p>
                    <p className="text-sm">hair salon</p>
                </div>

                <a
                    href="https://www.instagram.com/nua_nua_nua__/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-3 border border-foreground/20 hover:border-foreground/60 transition-colors duration-300 text-sm tracking-widest mt-4"
                >
                    INSTAGRAM
                </a>
            </motion.div>
        </section>
    );
}
