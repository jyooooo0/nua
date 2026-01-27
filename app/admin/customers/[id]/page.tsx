"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Customer, Visit } from "@/app/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Calendar, DollarSign, Clock, Plus, Edit2, Save } from "lucide-react";
import { format, differenceInDays, parseISO, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import { useParams } from "next/navigation";

export default function CustomerDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddVisitModal, setShowAddVisitModal] = useState(false);
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);

    // Edit Customer Form
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editNotes, setEditNotes] = useState("");

    // New Visit Form
    const [visitDate, setVisitDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [visitServices, setVisitServices] = useState<string[]>([]);
    const [visitPrice, setVisitPrice] = useState("");
    const [visitNotes, setVisitNotes] = useState("");

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        // Fetch Customer
        const { data: customerData, error: customerError } = await supabase
            .from("customers")
            .select("*")
            .eq("id", id)
            .single();

        if (customerError) {
            console.error("Error fetching customer:", customerError);
        } else {
            setCustomer(customerData);
            setEditName(customerData.name);
            setEditPhone(customerData.phone || "");
            setEditEmail(customerData.email || "");
            setEditNotes(customerData.notes || "");
        }

        // Fetch Visits
        const { data: visitsData, error: visitsError } = await supabase
            .from("visits")
            .select("*")
            .eq("customer_id", id)
            .order("visit_date", { ascending: false });

        if (visitsError) {
            console.error("Error fetching visits:", visitsError);
        } else {
            setVisits(visitsData || []);
        }
        setLoading(false);
    };

    const handleUpdateCustomer = async () => {
        const { error } = await supabase
            .from("customers")
            .update({
                name: editName,
                phone: editPhone,
                email: editEmail,
                notes: editNotes,
            })
            .eq("id", id);

        if (error) {
            alert("更新に失敗しました: " + error.message);
        } else {
            setIsEditingCustomer(false);
            fetchData(); // Reload
        }
    };

    const handleAddVisit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase
            .from("visits")
            .insert([
                {
                    customer_id: id,
                    visit_date: visitDate,
                    services: visitServices,
                    price: parseInt(visitPrice) || 0,
                    notes: visitNotes,
                },
            ]);

        if (error) {
            alert("登録に失敗しました: " + error.message);
        } else {
            setShowAddVisitModal(false);
            // Reset form
            setVisitServices([]);
            setVisitPrice("");
            setVisitNotes("");
            fetchData(); // Reload
        }
    };

    // Analysis Logic
    const calculateFrequency = () => {
        if (visits.length < 2) return null;
        const sortedVisits = [...visits].sort((a, b) => new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime());
        let totalDays = 0;
        for (let i = 1; i < sortedVisits.length; i++) {
            totalDays += differenceInDays(parseISO(sortedVisits[i].visit_date), parseISO(sortedVisits[i - 1].visit_date));
        }
        return Math.round(totalDays / (visits.length - 1));
    };

    const averageFrequency = calculateFrequency();
    const lastVisitDate = visits.length > 0 ? visits[0].visit_date : null;
    const nextVisitPrediction = lastVisitDate && averageFrequency
        ? format(addDays(parseISO(lastVisitDate), averageFrequency), "yyyy-MM-dd")
        : null;
    const totalSpend = visits.reduce((sum, v) => sum + (v.price || 0), 0);

    const toggleService = (service: string) => {
        if (visitServices.includes(service)) {
            setVisitServices(visitServices.filter(s => s !== service));
        } else {
            setVisitServices([...visitServices, service]);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#ebe6df] flex items-center justify-center text-wood">読み込み中...</div>;
    if (!customer) return <div className="min-h-screen bg-[#ebe6df] flex items-center justify-center text-wood">顧客が見つかりません</div>;

    return (
        <div className="min-h-screen bg-[#ebe6df] pb-24">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-wood/10 px-6 py-4 flex items-center gap-4">
                <Link href="/admin/customers" className="text-wood hover:text-wood/80">
                    <ChevronLeft />
                </Link>
                <h1 className="font-serif text-xl text-wood flex-1">{customer.name} 様</h1>
                <button
                    onClick={() => setIsEditingCustomer(!isEditingCustomer)}
                    className="text-wood/60 hover:text-wood"
                >
                    {isEditingCustomer ? <span className="text-sm">キャンセル</span> : <Edit2 className="w-5 h-5" />}
                </button>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* Customer Info / Edit Form */}
                <div className="bg-white p-6 rounded-sm shadow-sm">
                    {isEditingCustomer ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">お名前</label>
                                <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full border p-2 rounded-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">電話番号</label>
                                    <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full border p-2 rounded-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Email</label>
                                    <input value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full border p-2 rounded-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">メモ</label>
                                <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} className="w-full border p-2 rounded-sm h-20" />
                            </div>
                            <button onClick={handleUpdateCustomer} className="w-full bg-wood text-white py-2 rounded-sm flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> 保存する
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-xs uppercase text-gray-500 mb-1">連絡先</h2>
                                <p className="text-wood">{customer.phone || "-"}</p>
                                <p className="text-wood text-sm">{customer.email || "-"}</p>
                            </div>
                            <div>
                                <h2 className="text-xs uppercase text-gray-500 mb-1">メモ</h2>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap">{customer.notes || "なし"}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Analysis Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-sm shadow-sm flex items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">平均来店サイクル</p>
                            <p className="text-xl font-medium text-wood">{averageFrequency ? `${averageFrequency}日` : "データ不足"}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-sm shadow-sm flex items-center gap-4">
                        <div className="bg-green-50 p-3 rounded-full text-green-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">次回目安</p>
                            <p className="text-xl font-medium text-wood">{nextVisitPrediction ? format(parseISO(nextVisitPrediction), "M/d") : "-"}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-sm shadow-sm flex items-center gap-4">
                        <div className="bg-yellow-50 p-3 rounded-full text-yellow-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">総利用額</p>
                            <p className="text-xl font-medium text-wood">¥{totalSpend.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Visit History */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-serif text-lg text-wood">来店履歴</h2>
                        <button
                            onClick={() => setShowAddVisitModal(true)}
                            className="bg-wood text-white px-4 py-2 rounded-sm shadow-sm hover:bg-wood/90 transition-colors flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" /> 来店記録
                        </button>
                    </div>

                    <div className="space-y-4">
                        {visits.length === 0 ? (
                            <p className="text-center text-gray-400 py-8">履歴がありません</p>
                        ) : (
                            visits.map((visit) => (
                                <div key={visit.id} className="bg-white p-4 rounded-sm shadow-sm border-l-4 border-wood/20">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg text-wood">
                                                {format(parseISO(visit.visit_date), "yyyy年 M月d日(E)", { locale: ja })}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {format(parseISO(visit.visit_date), "HH:mm")}
                                            </span>
                                        </div>
                                        <span className="font-medium text-wood">¥{visit.price?.toLocaleString()}</span>
                                    </div>
                                    <div className="mb-2 flex flex-wrap gap-2">
                                        {visit.services && visit.services.map((service, idx) => (
                                            <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-xs text-xs">
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                    {visit.notes && (
                                        <p className="text-sm text-gray-600 bg-[#f9f8f6] p-3 rounded-sm whitespace-pre-wrap">
                                            {visit.notes}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Add Visit Modal */}
            <AnimatePresence>
                {showAddVisitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-md rounded-sm shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="px-6 py-4 border-b border-wood/10 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="font-serif text-lg text-wood">来店記録の追加</h3>
                                <button onClick={() => setShowAddVisitModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                            </div>
                            <form onSubmit={handleAddVisit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">来店日</label>
                                    <input
                                        type="date"
                                        required
                                        value={visitDate}
                                        onChange={(e) => setVisitDate(e.target.value)}
                                        className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">メニュー</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["カット", "カラー", "パーマ", "トリートメント", "スパ", "その他"].map((service) => (
                                            <button
                                                key={service}
                                                type="button"
                                                onClick={() => toggleService(service)}
                                                className={`px-3 py-1 rounded-full text-xs border transition-colors ${visitServices.includes(service)
                                                    ? "bg-wood text-white border-wood"
                                                    : "bg-white text-gray-500 border-gray-200 hover:border-wood"
                                                    }`}
                                            >
                                                {service}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">金額</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                                        <input
                                            type="number"
                                            value={visitPrice}
                                            onChange={(e) => setVisitPrice(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2 border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">カルテ / メモ</label>
                                    <textarea
                                        value={visitNotes}
                                        onChange={(e) => setVisitNotes(e.target.value)}
                                        className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood h-32"
                                        placeholder="カット内容、使用薬剤、会話内容など"
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowAddVisitModal(false)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-sm hover:bg-gray-50">キャンセル</button>
                                    <button type="submit" className="flex-1 py-2 bg-wood text-white rounded-sm hover:bg-wood/90">記録する</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
