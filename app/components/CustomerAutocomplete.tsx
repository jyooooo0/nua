"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Customer } from "@/app/lib/types";
import { User, Plus } from "lucide-react";

interface CustomerAutocompleteProps {
    onSelect: (customer: Customer) => void;
    placeholder?: string;
}

export default function CustomerAutocomplete({ onSelect, placeholder = "名前または電話番号で検索" }: CustomerAutocompleteProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Customer[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Search customers as user types
    useEffect(() => {
        const searchCustomers = async () => {
            if (query.length < 1) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from("customers")
                .select("*")
                .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
                .limit(10);

            if (!error && data) {
                setSuggestions(data);
            }
            setLoading(false);
        };

        const debounce = setTimeout(searchCustomers, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setQuery(customer.name);
        setShowDropdown(false);
        onSelect(customer);
    };

    const handleCreateNew = async () => {
        if (!query.trim()) return;

        setLoading(true);
        const { data, error } = await supabase
            .from("customers")
            .insert([{ name: query.trim() }])
            .select()
            .single();

        if (!error && data) {
            setSelectedCustomer(data);
            setShowDropdown(false);
            onSelect(data);
        } else {
            alert("顧客の登録に失敗しました: " + error?.message);
        }
        setLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setSelectedCustomer(null);
        setShowDropdown(true);
    };

    const formatCustomerId = (id: string) => {
        // Show last 4 characters of UUID for identification
        return id.slice(-4).toUpperCase();
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                placeholder={placeholder}
                className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
            />
            {selectedCustomer && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-wood/10 text-wood px-2 py-0.5 rounded-full">
                    ID: {formatCustomerId(selectedCustomer.id)}
                </span>
            )}

            {showDropdown && (query.length > 0 || suggestions.length > 0) && (
                <div
                    ref={dropdownRef}
                    className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg max-h-60 overflow-y-auto"
                >
                    {loading ? (
                        <div className="p-3 text-center text-gray-400 text-sm">検索中...</div>
                    ) : suggestions.length > 0 ? (
                        <>
                            {suggestions.map((customer) => (
                                <button
                                    key={customer.id}
                                    type="button"
                                    onClick={() => handleSelect(customer)}
                                    className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="w-8 h-8 bg-wood/10 rounded-full flex items-center justify-center text-wood text-sm">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-wood">{customer.name}</div>
                                        <div className="text-xs text-gray-400">
                                            {customer.phone || "電話番号なし"} · ID: {formatCustomerId(customer.id)}
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {/* Option to create new if no exact match */}
                            <button
                                type="button"
                                onClick={handleCreateNew}
                                className="w-full p-3 text-left hover:bg-green-50 flex items-center gap-3 text-green-700 border-t border-gray-200"
                            >
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-medium">「{query}」を新規登録</div>
                                    <div className="text-xs text-green-600">この名前で新しい顧客を作成</div>
                                </div>
                            </button>
                        </>
                    ) : query.length > 0 ? (
                        <button
                            type="button"
                            onClick={handleCreateNew}
                            className="w-full p-3 text-left hover:bg-green-50 flex items-center gap-3 text-green-700"
                        >
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Plus className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="font-medium">「{query}」を新規登録</div>
                                <div className="text-xs text-green-600">この名前で新しい顧客を作成</div>
                            </div>
                        </button>
                    ) : null}
                </div>
            )}
        </div>
    );
}
