"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const menuLinks = [
    { name: "Top", href: "#hero" },
    { name: "Concept", href: "#concept" },
    { name: "Gallery", href: "#gallery" },
    { name: "Price", href: "#price" },
    { name: "Profile", href: "#profile" },
    { name: "Reservation", href: "#reservation" },
    { name: "Info", href: "#info" },
];

export default function Menu() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
        e.preventDefault();
        setIsOpen(false);
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={toggleMenu}
                className="fixed top-8 right-8 z-50 flex flex-col justify-center items-center w-12 h-12 bg-transparent gap-1.5 mix-blend-difference group"
            >
                <div className={`w-8 h-[1px] bg-[#e8e6e3] transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
                <div className={`w-8 h-[1px] bg-[#e8e6e3] transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                <div className={`w-8 h-[1px] bg-[#e8e6e3] transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </button>

            {/* Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-40 bg-[#2a2826] flex flex-col items-center justify-center text-[#e8e6e3]"
                    >
                        <nav className="flex flex-col gap-8 text-center">
                            {menuLinks.map((link, index) => (
                                <motion.a
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => handleScroll(e, link.href)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                                    className="text-2xl font-serif italic tracking-widest hover:text-wood-light transition-colors"
                                >
                                    {link.name}
                                </motion.a>
                            ))}
                        </nav>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.5 }}
                            className="absolute bottom-12 text-xs tracking-widest opacity-30"
                        >
                            nua
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
