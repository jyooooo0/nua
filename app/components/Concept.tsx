"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Concept() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

    return (
        <section ref={ref} className="relative w-full py-32 md:py-48 px-6 bg-background flex justify-center items-center">
            <motion.div
                initial={{ opacity: 0, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 1.2 }}
                className="max-w-2xl mx-auto text-center md:text-left writing-vertical-md"
            >
                <div className="flex flex-col md:flex-row gap-12 items-center md:items-start justify-center">
                    {/* English / Subtitle */}
                    <div className="flex flex-col gap-4 order-2 md:order-1 mt-12 md:mt-0 font-serif text-wood text-lg md:text-xl tracking-wide">
                        <p>Stay quiet.</p>
                        <p>Stay polite.</p>
                        <p>Organize hair & heart.</p>
                    </div>

                    {/* Main Japanese Concept - Vertical text on desktop maybe? Or just centered clean text. 
                Let's stick to horizontal for readability but with lots of space, or pseudo-vertical layout style.
                Actually, the user prompt showed horizontal text:
                "静かに、丁寧に、髪と心を整える場所"
                Let's make it elegant horizontal.
            */}

                    <div className="order-1 md:order-2 space-y-8 text-foreground">
                        <h2 className="text-2xl md:text-3xl font-light leading-relaxed tracking-widest">
                            静かに、丁寧に、<br />
                            髪と心を整える場所
                        </h2>
                        <p className="text-sm md:text-base leading-loose text-foreground/80 font-light">
                            日々の中にある喧騒から少し離れて<br />
                            自分自身と向き合うための時間。<br />
                            <br />
                            nuaは、髪を整えるだけでなく<br />
                            心まで軽くなるような<br />
                            そんな場所でありたいと願っています。
                        </p>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
