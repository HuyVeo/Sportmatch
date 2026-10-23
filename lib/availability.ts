import { WEEKDAYS, type AvailabilitySlot, type Weekday } from "@/lib/types";

/**
 * Tiện ích lịch rảnh dùng chung cho client (form) và server (validate trước
 * khi ghi DB). Giờ được lưu bằng số phút tính từ 00:00.
 */

export const DAY_END_MINUTE = 23 * 60 + 59;
export const MAX_AVAILABILITY_SLOTS = 35;

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** "HH:MM" → số phút; chuỗi rỗng / sai định dạng → `null`. */
export function timeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function isFullDay(slot: { startMinute: number; endMinute: number }) {
  return slot.startMinute === 0 && slot.endMinute >= DAY_END_MINUTE;
}

export function formatSlot(slot: { startMinute: number; endMinute: number }) {
  if (isFullDay(slot)) return "Cả ngày";
  return `${minutesToTime(slot.startMinute)} – ${minutesToTime(slot.endMinute)}`;
}

/** Sắp theo thứ trong tuần (T2 → CN) rồi theo giờ bắt đầu. */
export function sortSlots<T extends AvailabilitySlot>(slots: T[]): T[] {
  return [...slots].sort(
    (a, b) =>
      WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day) ||
      a.startMinute - b.startMinute,
  );
}

export function groupSlotsByDay(
  slots: AvailabilitySlot[],
): { day: Weekday; slots: AvailabilitySlot[] }[] {
  return WEEKDAYS.map((day) => ({
    day,
    slots: sortSlots(slots.filter((slot) => slot.day === day)),
  })).filter((group) => group.slots.length > 0);
}

/** Hai khung giao nhau khi có phần thời gian chung (chạm mép thì không tính). */
export function slotsOverlap(
  a: { startMinute: number; endMinute: number },
  b: { startMinute: number; endMinute: number },
) {
  return a.startMinute < b.endMinute && b.startMinute < a.endMinute;
}

export type SlotDraft = { day: Weekday; start: string; end: string };

/**
 * Kiểm tra từng khung giờ trong form; trả về mảng lỗi cùng thứ tự (`null` là
 * hợp lệ). Khung trùng/chồng lên khung đứng trước cùng ngày bị báo lỗi.
 */
export function validateSlotDrafts(slots: SlotDraft[]): (string | null)[] {
  const parsed = slots.map((slot) => ({
    day: slot.day,
    startMinute: timeToMinutes(slot.start),
    endMinute: timeToMinutes(slot.end),
  }));

  return parsed.map((slot, index) => {
    if (slot.startMinute === null || slot.endMinute === null) {
      return "Chọn đủ giờ bắt đầu và giờ kết thúc.";
    }
    if (slot.endMinute <= slot.startMinute) {
      return "Giờ kết thúc phải sau giờ bắt đầu.";
    }
    for (let other = 0; other < index; other++) {
      const previous = parsed[other];
      if (
        previous.day !== slot.day ||
        previous.startMinute === null ||
        previous.endMinute === null ||
        previous.endMinute <= previous.startMinute
      ) {
        continue;
      }
      const current = {
        startMinute: slot.startMinute,
        endMinute: slot.endMinute,
      };
      const earlier = {
        startMinute: previous.startMinute,
        endMinute: previous.endMinute,
      };
      if (
        current.startMinute === earlier.startMinute &&
        current.endMinute === earlier.endMinute
      ) {
        return "Khung giờ này bị lặp lại.";
      }
      if (slotsOverlap(current, earlier)) {
        return `Trùng với khung ${formatSlot(earlier)} cùng ngày.`;
      }
    }
    return null;
  });
}

/** Bản kiểm tra cho server — dữ liệu đã ở dạng phút. */
export function validateSlots(slots: AvailabilitySlot[]): string | null {
  if (slots.length > MAX_AVAILABILITY_SLOTS) {
    return `Tối đa ${MAX_AVAILABILITY_SLOTS} khung giờ rảnh.`;
  }
  const errors = validateSlotDrafts(
    slots.map((slot) => ({
      day: slot.day,
      start:
        Number.isInteger(slot.startMinute) && slot.startMinute >= 0
          ? minutesToTime(slot.startMinute)
          : "",
      end:
        Number.isInteger(slot.endMinute) && slot.endMinute <= DAY_END_MINUTE
          ? minutesToTime(slot.endMinute)
          : "",
    })),
  );
  const index = errors.findIndex((error) => error !== null);
  return index === -1 ? null : `${slots[index].day}: ${errors[index]}`;
}
