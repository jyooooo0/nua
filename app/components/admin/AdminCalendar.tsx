"use client";

import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    isToday,
    addDays,
    subDays
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Reservation = {
    id: string | number;
    date: string; // YYYY-MM-DD
    // ... other fields
};

type ViewMode = 'month' | 'week' | 'day';

interface AdminCalendarProps {
    reservations: Reservation[];
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    viewMode: ViewMode;
    onChangeViewMode: (mode: ViewMode) => void;
}

export default function AdminCalendar({
    reservations,
    selectedDate,
    onSelectDate,
    viewMode,
    onChangeViewMode
}: AdminCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Navigation Handlers
    const next = () => {
        if (viewMode === 'month') {
            setCurrentMonth(addMonths(currentMonth, 1));
        } else if (viewMode === 'week') {
            onSelectDate(addWeeks(selectedDate, 1));
        } else {
            onSelectDate(addDays(selectedDate, 1));
        }
    };

    const prev = () => {
        if (viewMode === 'month') {
            setCurrentMonth(subMonths(currentMonth, 1));
        } else if (viewMode === 'week') {
            onSelectDate(subWeeks(selectedDate, 1));
        } else {
            onSelectDate(subDays(selectedDate, 1));
        }
    };

    // Calendar Generation Logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: ja }); // Starts on Sunday by default for ja? Usually Sunday.
    const endDate = endOfWeek(monthEnd, { locale: ja });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Week Generation Logic
    const weekStart = startOfWeek(selectedDate, { locale: ja });
    const weekEnd = endOfWeek(selectedDate, { locale: ja });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Helper to check if a day has reservations
    const hasReservation = (day: Date) => {
        const dayStr = format(day, "yyyy-MM-dd");
        return reservations.some(r => r.date === dayStr);
    };

    return (
        <div className="bg-white rounded-sm shadow-sm border border-wood/10 p-4">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">

                {/* View Switcher */}
                <div className="flex bg-[#f2efe9] p-1 rounded-sm">
                    <button
                        onClick={() => onChangeViewMode('day')}
                        className={`px-4 py-1.5 text-xs rounded-xs transition-all ${viewMode === 'day' ? 'bg-white shadow-sm text-wood font-bold' : 'text-wood/60 hover:text-wood'}`}
                    >
                        今日
                    </button>
                    <button
                        onClick={() => onChangeViewMode('week')}
                        className={`px-4 py-1.5 text-xs rounded-xs transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-wood font-bold' : 'text-wood/60 hover:text-wood'}`}
                    >
                        週
                    </button>
                    <button
                        onClick={() => {
                            onChangeViewMode('month');
                            setCurrentMonth(selectedDate); // Sync month view to selected date
                        }}
                        className={`px-4 py-1.5 text-xs rounded-xs transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-wood font-bold' : 'text-wood/60 hover:text-wood'}`}
                    >
                        月
                    </button>
                </div>

                {/* Date Navigator */}
                <div className="flex items-center gap-4">
                    <button onClick={prev} className="p-1 hover:bg-wood/5 rounded-full text-wood">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-serif text-wood font-medium">
                        {viewMode === 'month'
                            ? format(currentMonth, "yyyy年 M月", { locale: ja })
                            : format(selectedDate, "yyyy年 M月", { locale: ja })
                        }
                    </h2>
                    <button onClick={next} className="p-1 hover:bg-wood/5 rounded-full text-wood">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* View Content */}
            {viewMode === 'month' && (
                <div className="grid grid-cols-7 gap-1 text-center">
                    {/* Days of Week Header */}
                    {['日', '月', '火', '水', '木', '金', '土'].map(d => (
                        <div key={d} className="text-xs text-wood/40 py-2">{d}</div>
                    ))}

                    {/* Calendar Grid */}
                    {calendarDays.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isSelected = isSameDay(day, selectedDate);
                        const isTodayDate = isToday(day);
                        const hasRes = hasReservation(day);

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => onSelectDate(day)}
                                className={`
                                    relative h-10 md:h-14 flex flex-col items-center justify-center text-sm rounded-sm transition-colors
                                    ${!isCurrentMonth ? 'text-gray-300' : 'text-wood'}
                                    ${isSelected ? 'bg-gray-800 text-white shadow-md' : 'hover:bg-[#f2efe9]'}
                                    ${isTodayDate && !isSelected ? 'font-bold text-wood border border-wood/30' : ''}
                                `}
                            >
                                <span>{format(day, "d")}</span>
                                {hasRes && (
                                    <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-wood/60'}`}></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {viewMode === 'week' && (
                <div className="grid grid-cols-7 gap-1 text-center">
                    {['日', '月', '火', '水', '木', '金', '土'].map(d => (
                        <div key={d} className="text-xs text-wood/40 py-2">{d}</div>
                    ))}
                    {weekDays.map((day) => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isTodayDate = isToday(day);
                        const hasRes = hasReservation(day);

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => onSelectDate(day)}
                                className={`
                                    relative h-20 flex flex-col items-center justify-center text-sm rounded-sm transition-colors border border-transparent
                                    ${isSelected ? 'bg-gray-800 text-white shadow-md' : 'bg-[#f9f8f6] hover:bg-[#f2efe9]'}
                                    ${isTodayDate && !isSelected ? 'border-wood/30' : ''}
                                `}
                            >
                                <span className="text-xs mb-1">{format(day, "d")}</span>
                                {hasRes && (
                                    <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-wood/60'}`}>●</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Day View is mostly handled by the list below this component, but we can show a specific header date here if needed */}
        </div>
    );
}
