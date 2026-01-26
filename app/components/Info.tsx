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
                <h3 className="text-2xl font-serif text-wood italic mb-4">Information</h3>

                <div className="space-y-6 text-foreground/80 tracking-custom">
                    {/* Address */}
                    <div className="space-y-1">
                        <p className="text-xs text-wood uppercase tracking-widest">Address</p>
                        <p className="text-sm leading-relaxed">
                            〒997-0803<br />
                            山形県鶴岡市伊勢横内畑福22-8<br />
                            あけぼのテナント2
                        </p>
                        <a
                            href="https://maps.app.goo.gl/uP4J"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-wood/80 hover:text-accent border-b border-wood/30 pb-0.5 inline-block mt-1 transition-colors"
                        >
                            Google Map
                        </a>
                    </div>

                    {/* Hours */}
                    <div className="space-y-1">
                        <p className="text-xs text-wood uppercase tracking-widest">Hours</p>
                        <p className="text-sm">9:00 - 18:00</p>
                        <p className="text-xs text-foreground/60">定休日：月曜日</p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                        <p className="text-xs text-wood uppercase tracking-widest">Tel</p>
                        <a href="tel:07084934839" className="text-sm hover:text-wood transition-colors">070-8493-4839</a>
                    </div>

                    {/* Instagram */}
                    <div className="pt-4">
                        <a
                            href="https://www.instagram.com/nua_nua_nua__/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-8 py-3 border border-foreground/20 hover:border-foreground/60 hover:bg-white/50 transition-all duration-300 text-xs tracking-widest"
                        >
                            INSTAGRAM
                        </a>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
