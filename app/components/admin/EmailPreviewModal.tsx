"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Booking } from "@/app/lib/types";

type EmailType = "confirmation" | "cancellation" | "resuggestion";

interface EmailPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    booking: Booking;
    type: EmailType;
    alternativeDates?: { date: string; time: string }[];
}

export default function EmailPreviewModal({
    isOpen,
    onClose,
    onConfirm,
    booking,
    type,
    alternativeDates,
}: EmailPreviewModalProps) {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

    // Generate Default Template
    useEffect(() => {
        if (!isOpen || !booking) return;

        let defaultSubject = "";
        let defaultBody = "";

        const shopSignature = `
--------------------------------------------------
nua
〒997-0803 山形県鶴岡市伊勢横内畑福22-8 あけぼのテナント2
Tel: 070-8493-4839
Maps: https://maps.app.goo.gl/uP4J
--------------------------------------------------
`;

        if (type === "confirmation") {
            defaultSubject = "【nua】ご予約確定のお知らせ";
            defaultBody = `${booking.customer_name} 様

この度は nua にご予約いただき、誠にありがとうございます。
以下の内容でご予約を確定いたしました。

■ご予約内容
日時： ${booking.date} ${booking.start_time} - ${booking.end_time}
メニュー： ${booking.menu_name}
金額： ¥${booking.menu_price?.toLocaleString()}
場所： nua（鶴岡市伊勢横内畑福22-8）

当日はお気をつけてお越しください。
お待ちしております。
${shopSignature}`;

        } else if (type === "cancellation") {
            defaultSubject = "【nua】ご予約キャンセルのお知らせ";
            defaultBody = `${booking.customer_name} 様

nua です。
この度はご予約を承ることができず、大変申し訳ございません。
誠に勝手ながら、今回のご予約をキャンセルとさせていただきました。

■キャンセル内容
日時： ${booking.date} ${booking.start_time}
メニュー： ${booking.menu_name}

またの機会がございましたら、ぜひよろしくお願いいたします。
${shopSignature}`;

        } else if (type === "resuggestion") {
            defaultSubject = "【nua】日程変更のご提案";
            const alternativesText = alternativeDates
                ?.filter(d => d.date && d.time)
                .map((d, i) => `案${i + 1}: ${d.date} ${d.time}`)
                .join("\n") || "";

            defaultBody = `${booking.customer_name} 様

nua です。
ご予約いただいた日時ですが、あいにく他のお客様の予約が入ってしまっており、ご案内することができません。
大変申し訳ございません。

もしよろしければ、以下の日程はいかがでしょうか？

■ご提案日時
${alternativesText}

上記以外でも、ご都合の良い日時がございましたらお知らせください。
お手数をおかけしますが、ご返信をお待ちしております。
${shopSignature}`;
        }

        setSubject(defaultSubject);
        setBody(defaultBody);
    }, [isOpen, booking, type, alternativeDates]);

    const handleConfirm = () => {
        // Create Gmail Link
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(booking.customer_email || "")}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Open Gmail in new tab
        window.open(gmailUrl, '_blank');

        // Execute status update callback
        onConfirm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white w-full max-w-2xl rounded-sm shadow-xl flex flex-col max-h-[90vh]"
                >
                    <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-700">メール作成プレビュー</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto space-y-4">
                        <div className="bg-yellow-50 p-3 rounded-sm text-xs text-yellow-800 border border-yellow-200">
                            <strong>確認:</strong> 送信ボタンを押すとGmailが起動します。<br />
                            ご自身のGmailアカウント(nua.nua.nua1125@gmail.com)にログインした状態で実行してください。
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">送信先 (To)</label>
                            <input
                                type="text"
                                value={booking.customer_email || ""}
                                disabled
                                className="w-full p-2 bg-gray-100 border rounded-sm text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">件名 (Subject)</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-sm text-sm focus:border-wood outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">本文 (Body)</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-sm text-sm h-64 focus:border-wood outline-none font-mono text-xs leading-relaxed"
                            />
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-sm text-sm transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-wood text-white rounded-sm text-sm hover:bg-wood/90 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <span>✉</span> 承認してGmailを開く
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
