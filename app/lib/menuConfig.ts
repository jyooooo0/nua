// Menu configuration with duration in 30-minute slots
export interface MenuItem {
    id: string;
    name: string;
    nameJa: string;
    slotsRequired: number; // Number of 30-minute slots
    durationMinutes: number;
}

export const MENU_ITEMS: MenuItem[] = [
    { id: "cut", name: "Cut", nameJa: "カット", slotsRequired: 2, durationMinutes: 60 },
    { id: "color", name: "Color", nameJa: "カラー", slotsRequired: 4, durationMinutes: 120 },
    { id: "perm", name: "Perm", nameJa: "パーマ", slotsRequired: 4, durationMinutes: 120 },
    { id: "treatment", name: "Treatment", nameJa: "トリートメント", slotsRequired: 2, durationMinutes: 60 },
    { id: "head_spa", name: "Head Spa", nameJa: "ヘッドスパ", slotsRequired: 2, durationMinutes: 60 },
    { id: "cut_color", name: "Cut & Color", nameJa: "カット & カラー", slotsRequired: 5, durationMinutes: 150 },
    { id: "cut_perm", name: "Cut & Perm", nameJa: "カット & パーマ", slotsRequired: 5, durationMinutes: 150 },
    { id: "other", name: "Other", nameJa: "その他", slotsRequired: 2, durationMinutes: 60 },
];

// All available time slots (30-minute intervals)
export const ALL_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00"
];

// Get the slots that would be occupied by a reservation
export function getOccupiedSlots(startTime: string, slotsRequired: number): string[] {
    const startIndex = ALL_SLOTS.indexOf(startTime);
    if (startIndex === -1) return [];
    return ALL_SLOTS.slice(startIndex, startIndex + slotsRequired);
}

// Check if a slot is available (not blocked by any existing reservation)
export function isSlotAvailable(
    slot: string,
    slotsRequired: number,
    blockedSlots: string[]
): boolean {
    const neededSlots = getOccupiedSlots(slot, slotsRequired);
    // Check if we have enough slots remaining in the day
    if (neededSlots.length < slotsRequired) return false;
    // Check if any needed slot is already blocked
    return !neededSlots.some(s => blockedSlots.includes(s));
}

// Get end time based on start time and slots required
export function getEndTime(startTime: string, slotsRequired: number): string {
    const startIndex = ALL_SLOTS.indexOf(startTime);
    const endIndex = startIndex + slotsRequired;
    if (endIndex >= ALL_SLOTS.length) {
        // Extends past business hours
        return "19:30";
    }
    return ALL_SLOTS[endIndex];
}
