"use client";

import { motion } from "framer-motion";
import Image from "next/image";
// Using a placeholder or reusing an asset temporarily if needed, 
// but for a profile, a div placeholder is often clearer that it's waiting for a specific photo.
// However, to satisfy "brush up", I'll make the placeholder look elegant.

export default function Profile() {
    return (
        <section className="w-full py-32 px-6 bg-[#2a2826] text-[#e8e6e3]">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">

                {/* Image Placeholder */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="w-full md:w-1/2 aspect-[3/4] bg-[#3a3836] relative overflow-hidden flex items-center justify-center p-8"
                >
                    <div className="border border-[#e8e6e3]/20 w-full h-full flex items-center justify-center">
                        <span className="font-serif italic text-[#e8e6e3]/40 tracking-widest">Photograph</span>
                    </div>
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left"
                >
                    <h3 className="text-xl font-serif italic text-wood-light mb-2 tracking-widest">Owner Stylist</h3>
                    <h2 className="text-2xl md:text-3xl font-light mb-8 tracking-wider">
                        Name Placeholder<br />
                        <span className="text-base md:text-lg opacity-60 mt-2 block font-serif">Takashi Tanaka</span>
                    </h2>

                    <div className="space-y-6 text-sm md:text-base leading-loose font-light opacity-80">
                        <p>
                            美容室での時間は、<br />
                            ただ髪を切るだけのものではありません。
                        </p>
                        <p>
                            日々の忙しさを忘れ、<br />
                            自分自身と向き合う静かなひととき。
                        </p>
                        <p>
                            一人ひとりのお客様のライフスタイルに寄り添い、<br />
                            その人らしさを引き出すスタイルをご提案いたします。
                        </p>
                    </div>

                    <div className="mt-12 pt-8 border-t border-[#e8e6e3]/10 w-full">
                        <p className="text-xs tracking-widest opacity-50 uppercase">Career</p>
                        <ul className="mt-4 space-y-2 text-sm opacity-70">
                            <li>2010 - 都内某サロン勤務</li>
                            <li>2015 - 渡英・ロンドンにて研修</li>
                            <li>2020 - nua オープン</li>
                        </ul>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
