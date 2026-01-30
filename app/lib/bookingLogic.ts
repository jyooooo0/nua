import { supabase } from "./supabaseClient";
import { addMinutes, format, parse, isBefore, isAfter, areIntervalsOverlapping, set } from "date-fns";
import { Booking, Menu, AdminSchedule } from "./types";

// Constants
export const OPEN_TIME = "09:00";
export const CLOSE_TIME = "18:00";
export const SLOT_INTERVAL = 30; // minutes

// Generate all possible slots for a day
export const generateAllSlots = (openTime: string, closeTime: string, interval: number): string[] => {
    const slots: string[] = [];
    let current = parse(openTime, "HH:mm", new Date());
    const end = parse(closeTime, "HH:mm", new Date());

    while (isBefore(current, end)) { // < End Time
        slots.push(format(current, "HH:mm"));
        current = addMinutes(current, interval);
    }
    return slots;
};

export const ALL_SLOTS = generateAllSlots(OPEN_TIME, CLOSE_TIME, SLOT_INTERVAL);

/**
 * Fetch all active menus from DB
 */
export async function getMenus(): Promise<Menu[]> {
    const { data, error } = await supabase
        .from("menus")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching menus:", error);
        return [];
    }
    return data || [];
}

/**
 * Calculate available start times given a date and duration
 */
/**
 * Calculate available start times given a date and duration
 */
export async function getAvailableSlots(date: string, durationMinutes: number, bufferMinutes: number = 30): Promise<string[]> {
    // 1. Get existing bookings for the date
    const { data: bookings, error: bookingError } = await supabase
        .from("bookings") // Use new 'bookings' table
        .select("start_time, end_time")
        .eq("date", date)
        .neq("status", "cancelled")
        .neq("status", "rejected");

    // 2. Get admin schedules (breaks/holidays)
    const { data: schedules, error: scheduleError } = await supabase
        .from("admin_schedules")
        .select("start_time, end_time")
        .eq("date", date);

    if (bookingError || scheduleError) {
        console.error("Error fetching availability data", bookingError, scheduleError);
        return [];
    }

    // Combine busy intervals
    // Default system buffer for EXISTING bookings is 30 mins
    // (We assume all existing bookings need 30 mins cleanup unless specified otherwise,
    //  but for now hardcoding 30 mins is safe to prevent overlaps)
    const SYSTEM_BUFFER = 30;

    const busyIntervals = [
        ...(bookings || []).map(b => ({
            start: parse(b.start_time, "HH:mm:ss", new Date()),
            // Extend existing bookings by system buffer
            end: addMinutes(parse(b.end_time, "HH:mm:ss", new Date()), SYSTEM_BUFFER)
        })),
        ...(schedules || []).map(s => ({
            start: parse(s.start_time, "HH:mm:ss", new Date()),
            end: parse(s.end_time, "HH:mm:ss", new Date())
        }))
    ];

    // 3. Check each slot
    const availableSlots: string[] = [];

    for (const slot of ALL_SLOTS) {
        const slotStart = parse(slot, "HH:mm", new Date());
        // Service End Time (Customer leaves)
        const serviceEnd = addMinutes(slotStart, durationMinutes);
        // Block End Time (Including buffer for this new booking)
        const blockEnd = addMinutes(serviceEnd, bufferMinutes);

        // Define the proposed interval (Total time occupied)
        const proposedInterval = { start: slotStart, end: blockEnd };

        // Check if SERVICE exceeds business hours (Cleanup can happen after valid hours? 
        // Usually reception must end so service ends by close time)
        const businessClose = parse(CLOSE_TIME, "HH:mm", new Date());
        if (isAfter(serviceEnd, businessClose)) {
            continue; // Service must finish by close time
        }

        // Check for overlap with any busy interval
        const hasOverlap = busyIntervals.some(busy =>
            areIntervalsOverlapping(proposedInterval, busy)
        );

        if (!hasOverlap) {
            availableSlots.push(slot);
        }
    }

    return availableSlots;
}

/**
 * Calculate end time based on start time and duration
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
    const start = parse(startTime, "HH:mm", new Date());
    const end = addMinutes(start, durationMinutes);
    return format(end, "HH:mm");
}
