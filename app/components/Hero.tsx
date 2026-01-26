"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import textureImg from "../assets/texture.png";
import logoImg from "../assets/logo.png";

export default function Hero() {
    return (
        <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
            {/* Background Texture (Optional, subtle) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <Image
                    src={textureImg}
                    alt="texture"
                    fill
                    className="object-cover"
                    priority
                    placeholder="blur"
                />
            </div>

            {/* Main Logo & Title */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="z-10 flex flex-col items-center"
            >
                <div className="relative w-48 h-24 md:w-64 md:h-32">
                    <Image
                        src={logoImg}
                        alt="nua"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Subtitle / Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 flex flex-col items-center gap-2"
                >
                    <span className="text-xs tracking-widest text-foreground/60 font-serif">SCROLL</span>
                    <div className="w-[1px] h-12 bg-foreground/30" />
                </motion.div>
            </motion.div>
        </section>
    );
}
