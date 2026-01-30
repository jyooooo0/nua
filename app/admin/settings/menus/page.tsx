"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/app/components/AuthGuard";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { Menu } from "@/app/lib/types";

export default function MenuSettingsPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMenu, setCurrentMenu] = useState<Partial<Menu>>({});

    // Fetch menus
    const fetchMenus = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("menus")
            .select("*")
            .order("display_order", { ascending: true });

        if (error) {
            console.error("Error fetching menus:", error);
            alert("メニューの取得に失敗しました");
        } else {
            setMenus(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    // Save menu (Create or Update)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const menuData = {
            name: currentMenu.name,
            name_en: currentMenu.name_en,
            duration: parseInt(String(currentMenu.duration)),
            price: parseInt(String(currentMenu.price)),
            description: currentMenu.description,
            display_order: parseInt(String(currentMenu.display_order)) || 0,
        };

        let error;
        if (currentMenu.id) {
            // Update
            const { error: updateError } = await supabase
                .from("menus")
                .update(menuData)
                .eq("id", currentMenu.id);
            error = updateError;
        } else {
            // Create
            const { error: insertError } = await supabase
                .from("menus")
                .insert([menuData]);
            error = insertError;
        }

        if (error) {
            alert("保存に失敗しました: " + error.message);
        } else {
            setIsEditing(false);
            setCurrentMenu({});
            fetchMenus();
        }
    };

    // Delete menu
    const handleDelete = async (id: string) => {
        if (!confirm("本当に削除しますか？")) return;

        const { error } = await supabase
            .from("menus")
            .delete()
            .eq("id", id);

        if (error) {
            alert("削除に失敗しました: " + error.message);
        } else {
            fetchMenus();
        }
    };

    // Open modal
    const openModal = (menu?: Menu) => {
        if (menu) {
            setCurrentMenu(menu);
        } else {
            setCurrentMenu({
                display_order: (menus.length + 1) * 10,
                duration: 60,
                price: 5000
            });
        }
        setIsEditing(true);
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#ebe6df]">
                {/* Header */}
                <header className="bg-white border-b border-wood/10 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-400 hover:text-wood">← 戻る</Link>
                        <h1 className="font-serif text-xl text-wood">メニュー設定</h1>
                    </div>
                </header>

                <main className="p-6 max-w-4xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                            予約フォームに表示されるメニューを管理します。
                        </p>
                        <button
                            onClick={() => openModal()}
                            className="bg-wood text-white px-4 py-2 rounded-sm text-sm hover:bg-wood/90 transition-colors shadow-sm"
                        >
                            + 新規メニュー追加
                        </button>
                    </div>

                    <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f9f8f6] text-wood/60 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3 w-16 text-center">順序</th>
                                    <th className="px-6 py-3">メニュー名</th>
                                    <th className="px-6 py-3">時間</th>
                                    <th className="px-6 py-3">料金</th>
                                    <th className="px-6 py-3 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-wood/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">読み込み中...</td>
                                    </tr>
                                ) : menus.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">メニューが登録されていません</td>
                                    </tr>
                                ) : (
                                    menus.map((menu) => (
                                        <tr key={menu.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-center text-gray-400">{menu.display_order}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-wood">{menu.name}</div>
                                                <div className="text-xs text-gray-400">{menu.name_en}</div>
                                            </td>
                                            <td className="px-6 py-4">{menu.duration}分</td>
                                            <td className="px-6 py-4">¥{menu.price.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => openModal(menu)}
                                                    className="text-wood hover:underline"
                                                >
                                                    編集
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(menu.id)}
                                                    className="text-red-500 hover:text-red-700 hover:underline"
                                                >
                                                    削除
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>

                {/* Edit Modal */}
                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white w-full max-w-md rounded-sm shadow-lg overflow-hidden"
                            >
                                <div className="px-6 py-4 border-b border-wood/10 flex justify-between items-center">
                                    <h3 className="font-serif text-lg text-wood">
                                        {currentMenu.id ? "メニュー編集" : "新規メニュー"}
                                    </h3>
                                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">×</button>
                                </div>
                                <form onSubmit={handleSave} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1">メニュー名 (日本語)</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
                                            value={currentMenu.name || ""}
                                            onChange={e => setCurrentMenu({ ...currentMenu, name: e.target.value })}
                                            placeholder="例: カット"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1">英語名 (任意)</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
                                            value={currentMenu.name_en || ""}
                                            onChange={e => setCurrentMenu({ ...currentMenu, name_en: e.target.value })}
                                            placeholder="例: Cut"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase text-gray-500 mb-1">所要時間 (分)</label>
                                            <input
                                                type="number"
                                                required
                                                min="10"
                                                step="10"
                                                className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
                                                value={currentMenu.duration || ""}
                                                onChange={e => setCurrentMenu({ ...currentMenu, duration: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-500 mb-1">料金 (円)</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
                                                value={currentMenu.price || ""}
                                                onChange={e => setCurrentMenu({ ...currentMenu, price: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1">説明 (任意)</label>
                                        <textarea
                                            className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood h-20"
                                            value={currentMenu.description || ""}
                                            onChange={e => setCurrentMenu({ ...currentMenu, description: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1">表示順 (小さい順)</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
                                            value={currentMenu.display_order || ""}
                                            onChange={e => setCurrentMenu({ ...currentMenu, display_order: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-sm hover:bg-gray-50">キャンセル</button>
                                        <button type="submit" className="flex-1 py-2 bg-wood text-white rounded-sm hover:bg-wood/90">保存する</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </AuthGuard>
    );
}
