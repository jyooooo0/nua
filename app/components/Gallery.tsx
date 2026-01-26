"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import interior1 from "../assets/interior_1.png";
import exterior from "../assets/exterior.png";
import interior2 from "../assets/interior_2.png";

const images = [
    { src: interior1, alt: "Reception", aspect: "aspect-[4/3]" },
    { src: exterior, alt: "Exterior", aspect: "aspect-[3/4]" },
    { src: interior2, alt: "Styling Area", aspect: "aspect-[4/3]" },
];

export default function Gallery() {
    return (
        <section className="w-full py-24 px-4 md:px-12 bg-background">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">

                {/* Image 1 */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-[60vh] relative md:mt-12"
                >
                    <Image
                        src={images[0].src}
                        alt={images[0].alt}
                        fill
                        className="object-cover rounded-sm grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                        placeholder="blur"
                    />
                </motion.div>

                {/* Text / Space */}
                <div className="hidden md:block">
                    <p className="font-serif italic text-wood text-right text-lg">Space</p>
                </div>

                {/* Image 2 - Offset */}
                <div className="hidden md:block"></div>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full aspect-[3/4] relative md:-mt-32"
                >
                    <Image
                        src={images[1].src}
                        alt={images[1].alt}
                        fill
                        className="object-cover rounded-sm grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                        placeholder="blur"
                    />
                </motion.div>


                {/* Image 3 */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8 }}
                    className="w-full aspect-video relative md:col-span-2 md:w-3/4 md:mx-auto md:mt-24"
                >
                    <Image
                        src={images[2].src}
                        alt={images[2].alt}
                        fill
                        className="object-cover rounded-sm grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                        placeholder="blur"
                    />
                </motion.div>

            </div>
        </section>
    );
}
