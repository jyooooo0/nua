"use client";

import { motion } from "framer-motion";

type MenuItem = {
    name: string;
    price: string;
    duration?: string;
    note?: string;
};

type MenuCategory = {
    category: string;
    categoryEn: string;
    items: MenuItem[];
    note?: string;
};

const menuData: MenuCategory[] = [
    {
        category: "カット",
        categoryEn: "CUT",
        items: [
            { name: "カット", price: "¥4,400", duration: "60分" },
            { name: "カット（大学・専門生）", price: "¥3,850", duration: "60分" },
            { name: "カット（高校生）", price: "¥3,300", duration: "60分" },
            { name: "カット（小中学生）", price: "¥2,750", duration: "30分" },
            { name: "カット（未就学児）", price: "¥2,200", duration: "30分" },
            { name: "カット（1歳未満）", price: "¥1,650", duration: "30分" },
        ],
    },
    {
        category: "カラー",
        categoryEn: "COLOR",
        items: [
            { name: "根元リタッチ", price: "¥6,050", duration: "90分" },
            { name: "フルカラー ショート", price: "¥6,600", duration: "90分" },
            { name: "フルカラー ミディアム", price: "¥7,150", duration: "120分" },
            { name: "フルカラー ロング", price: "¥7,700", duration: "120分" },
            { name: "ブリーチ", price: "¥6,600〜", duration: "240分" },
            { name: "デザインカラー（※ハイライトカラー）", price: "¥6,600〜", duration: "240分", note: "ハイライト等の特殊カラー" },
        ],
    },
    {
        category: "カット + カラー",
        categoryEn: "CUT + COLOR",
        items: [
            { name: "カット + 根元リタッチ", price: "¥8,800", duration: "120分" },
            { name: "カット + フルカラー ショート", price: "¥9,450", duration: "120分" },
            { name: "カット + フルカラー ミディアム", price: "¥9,900", duration: "120分" },
            { name: "カット + フルカラー ロング", price: "¥10,450", duration: "150分" },
        ],
    },
    {
        category: "パーマ",
        categoryEn: "PERM",
        items: [
            { name: "パーマ", price: "¥8,800", duration: "120分" },
            { name: "デジタルパーマ", price: "¥9,900", duration: "150分", note: "コテ巻き風の形状記憶パーマ" },
            { name: "ストレートパーマ", price: "¥11,550〜", duration: "150分" },
            { name: "縮毛矯正", price: "¥16,500〜", duration: "210分" },
        ],
    },
    {
        category: "トリートメント",
        categoryEn: "TREATMENT",
        items: [
            { name: "トリートメント（ブローのみ）", price: "¥3,850", duration: "30分" },
        ],
    },
    {
        category: "ヘッドスパ",
        categoryEn: "HEAD SPA",
        items: [
            { name: "ヘッドスパ 30min", price: "¥3,300", duration: "30分" },
        ],
    },
    {
        category: "その他",
        categoryEn: "OTHER",
        items: [
            { name: "Set", price: "¥4,400", duration: "60分" },
            { name: "ブロー", price: "¥1,650", duration: "30分" },
            { name: "シャンプー", price: "¥770", duration: "30分" },
        ],
    },
];

// 追加オプション（メインメニューと併用可能）
const addOnOptions = [
    { name: "トリートメント（Set）", price: "¥2,200", duration: "30分" },
    { name: "ヘッドスパ 15min（Set）", price: "¥2,200", duration: "15分" },
];

export default function Price() {
    return (
        <section className="w-full py-32 px-6 bg-[#F8F6F4] text-center">
            <div className="max-w-4xl mx-auto">
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

                <div className="space-y-12">
                    {menuData.map((category, catIndex) => (
                        <motion.div
                            key={category.categoryEn}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                            className="text-left"
                        >
                            {/* Category Header */}
                            <div className="flex items-baseline gap-3 mb-4 border-b-2 border-wood/30 pb-2">
                                <h4 className="text-lg font-serif text-wood tracking-wide">{category.categoryEn}</h4>
                                <span className="text-xs text-wood/50">{category.category}</span>
                            </div>

                            {/* Menu Items */}
                            <div className="space-y-3 pl-2">
                                {category.items.map((item) => (
                                    <div
                                        key={item.name}
                                        className="border-b border-wood/10 pb-2"
                                    >
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-foreground/80">{item.name}</span>
                                            <div className="flex items-baseline gap-3">
                                                {item.duration && (
                                                    <span className="text-xs text-wood/50">{item.duration}</span>
                                                )}
                                                <span className="font-light text-wood tracking-widest text-sm">
                                                    {item.price}
                                                </span>
                                            </div>
                                        </div>
                                        {item.note && (
                                            <p className="text-xs text-orange-600/70 mt-1">※{item.note}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Category Note */}
                            {category.note && (
                                <p className="text-xs text-wood/50 mt-2 pl-2">{category.note}</p>
                            )}
                        </motion.div>
                    ))}

                    {/* 追加オプション */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.5 }}
                        className="text-left bg-wood/5 p-6 rounded-sm"
                    >
                        <div className="flex items-baseline gap-3 mb-4 border-b-2 border-wood/30 pb-2">
                            <h4 className="text-lg font-serif text-wood tracking-wide">OPTION</h4>
                            <span className="text-xs text-wood/50">追加オプション</span>
                        </div>
                        <p className="text-xs text-wood/60 mb-4">※カット・カラー・パーマ等と併用いただけます</p>
                        <div className="space-y-3 pl-2">
                            {addOnOptions.map((item) => (
                                <div
                                    key={item.name}
                                    className="flex justify-between items-end border-b border-wood/10 pb-2"
                                >
                                    <span className="text-sm text-foreground/80">{item.name}</span>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-xs text-wood/50">{item.duration}</span>
                                        <span className="font-light text-wood tracking-widest text-sm">
                                            {item.price}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mt-16 space-y-12"
                >
                    <div className="text-xs text-wood/50 leading-loose">
                        <p>※金額は全て税込表示となります。</p>
                        <p>※「〜」の表記があるメニューは、髪の長さや状態により変動します。</p>
                        <p>詳細はカウンセリング時にご案内いたします。</p>
                    </div>

                    <div className="pt-8 border-t border-wood/10">
                        <p className="text-xs text-wood uppercase tracking-widest mb-4">Payment Methods</p>
                        <p className="text-sm text-wood/80 leading-relaxed font-serif tracking-wide">
                            VISA / Mastercard / JCB<br />
                            d払い
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
