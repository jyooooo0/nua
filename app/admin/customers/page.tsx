"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Customer } from "@/app/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, Plus, Phone, Mail, User, ChevronLeft } from "lucide-react";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");
    const [newCustomerEmail, setNewCustomerEmail] = useState("");
    const [newCustomerNotes, setNewCustomerNotes] = useState("");

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching customers:", error);
        } else {
            setCustomers(data || []);
        }
        setLoading(false);
    };

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await supabase
            .from("customers")
            .insert([
                {
                    name: newCustomerName,
                    phone: newCustomerPhone,
                    email: newCustomerEmail,
                    notes: newCustomerNotes,
                },
            ])
            .select();

        if (error) {
            console.error("Error adding customer:", error);
            alert("エラーが発生しました: " + error.message);
        } else {
            if (data) {
                setCustomers([data[0], ...customers]);
                setShowAddModal(false);
                // Reset form
                setNewCustomerName("");
                setNewCustomerPhone("");
                setNewCustomerEmail("");
                setNewCustomerNotes("");
            }
        }
    };

    const filteredCustomers = customers.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
    );

    return (
        <div className="min-h-screen bg-[#ebe6df] pb-24">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-wood/10 px-6 py-4 flex items-center gap-4">
                <Link href="/admin" className="text-wood hover:text-wood/80">
                    <ChevronLeft />
                </Link>
                <h1 className="font-serif text-xl text-wood">顧客管理</h1>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {/* Actions */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="名前または電話番号で検索"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-wood/20 rounded-sm focus:outline-none focus:border-wood bg-white"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-wood text-white px-4 py-2 rounded-sm shadow-sm hover:bg-wood/90 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> 顧客登録
                    </button>
                </div>

                {/* List */}
                <div className="bg-white rounded-sm shadow-sm overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">読み込み中...</div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">顧客が見つかりません。</div>
                    ) : (
                        <div className="divide-y divide-wood/10">
                            {filteredCustomers.map((customer) => (
                                <Link
                                    key={customer.id}
                                    href={`/admin/customers/${customer.id}`}
                                    className="block p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-wood/10 rounded-full flex items-center justify-center text-wood font-serif">
                                                {customer.name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-wood">{customer.name}</h3>
                                                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                                    {customer.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" /> {customer.phone}
                                                        </span>
                                                    )}
                                                    {customer.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" /> {customer.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-gray-400">
                                            <ChevronLeft className="w-5 h-5 rotate-180" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-md rounded-sm shadow-lg overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-wood/10 flex justify-between items-center">
                                <h3 className="font-serif text-lg text-wood">新規顧客登録</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                            </div>
                            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">お名前 <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        value={newCustomerName}
                                        onChange={(e) => setNewCustomerName(e.target.value)}
                                        className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
                                        placeholder="山田 花子"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1">電話番号</label>
                                        <input
                                            type="tel"
                                            value={newCustomerPhone}
                                            onChange={(e) => setNewCustomerPhone(e.target.value)}
                                            className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
                                            placeholder="090-0000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1">メールアドレス</label>
                                        <input
                                            type="email"
                                            value={newCustomerEmail}
                                            onChange={(e) => setNewCustomerEmail(e.target.value)}
                                            className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
                                            placeholder="example@email.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">メモ</label>
                                    <textarea
                                        value={newCustomerNotes}
                                        onChange={(e) => setNewCustomerNotes(e.target.value)}
                                        className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood h-24"
                                        placeholder="特記事項など"
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-sm hover:bg-gray-50">キャンセル</button>
                                    <button type="submit" className="flex-1 py-2 bg-wood text-white rounded-sm hover:bg-wood/90">登録する</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
