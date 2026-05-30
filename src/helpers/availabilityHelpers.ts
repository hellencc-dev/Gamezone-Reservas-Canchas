import { normalizeReservationStatus } from "../components/status-badge";

export type ReservationLike = {
  id?: string;
  userId?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  createdAt?: unknown;
  expiresAt?: unknown;
  lockedUntil?: unknown;
};

export type WeeklyAvailabilityLike = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
};

export type SpecialDateLike = {
  date: string;
  available: boolean;
  note?: string;
  startTime?: string;
  endTime?: string;
};

export type SlotStatus = "available" | "busy" | "mine";

export type AvailabilityDecision = {
  available: boolean;
  reason: string;
  source: "habitual" | "special-open" | "special-closed" | "closed" | "maintenance";
  intervals: Array<{ startTime: string; endTime: string }>;
};

const BLOCKING_STATUSES = new Set(["temporal", "confirmada"]);
const DEFAULT_SPECIAL_INTERVAL = { startTime: "08:00", endTime: "22:00" };
const HOLD_TIME_SECONDS = 5 * 60;

export function toMillis(value: unknown) {
  if (!value) return null;

  if (value instanceof Date) return value.getTime();

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    const millis = date.getTime();
    return Number.isNaN(millis) ? null : millis;
  }

  if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }

  return null;
}

export function parseTimeToMinutes(value?: string) {
  if (!value) return null;

  const clean = value.trim().toUpperCase();
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (match12) {
    let hours = Number(match12[1]);
    const minutes = Number(match12[2]);
    const period = match12[3];

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);

  if (match24) {
    return Number(match24[1]) * 60 + Number(match24[2]);
  }

  return null;
}

export function formatMinutesToDisplay(minutes: number) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
}

export function formatMinutesToInput(minutes: number) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function getReservationRange(reservation: ReservationLike) {
  const start = parseTimeToMinutes(reservation.startTime);
  const explicitEnd = parseTimeToMinutes(reservation.endTime);

  if (start === null) return null;

  const duration = Number(reservation.duration || 60);
  const end = explicitEnd !== null ? explicitEnd : start + duration;

  return { start, end: end <= start ? start + duration : end };
}

export function isBlockingReservation(reservation: ReservationLike) {
  return BLOCKING_STATUSES.has(normalizeReservationStatus(reservation.status || ""));
}

export function getReservationExpirationMillis(reservation: ReservationLike) {
  const explicitExpiration = toMillis(reservation.expiresAt || reservation.lockedUntil);

  if (explicitExpiration !== null) return explicitExpiration;

  const createdAt = toMillis(reservation.createdAt);
  return createdAt === null ? null : createdAt + HOLD_TIME_SECONDS * 1000;
}

export function getReservationRemainingSeconds(reservation: ReservationLike, now = Date.now()) {
  const expiresAt = getReservationExpirationMillis(reservation);

  if (expiresAt === null) return HOLD_TIME_SECONDS;

  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}

export function isActiveTemporaryReservation(reservation: ReservationLike, now = Date.now()) {
  return (
    normalizeReservationStatus(reservation.status || "") === "temporal" &&
    getReservationRemainingSeconds(reservation, now) > 0
  );
}

export function rangesOverlap(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA;
}

export function reservationOverlaps(
  slotStart: string,
  duration: number,
  reservation: ReservationLike,
) {
  if (!isBlockingReservation(reservation)) return false;

  const start = parseTimeToMinutes(slotStart);
  const range = getReservationRange(reservation);

  if (start === null || !range) return false;

  return rangesOverlap(start, start + duration, range.start, range.end);
}

export function getOverlappingReservations(
  slotStart: string,
  duration: number,
  reservations: ReservationLike[],
) {
  return reservations.filter((reservation) =>
    reservationOverlaps(slotStart, duration, reservation)
  );
}

export function generateThirtyMinuteSlots(intervals: Array<{ startTime: string; endTime: string }>) {
  const slots: string[] = [];

  intervals.forEach((interval) => {
    const start = parseTimeToMinutes(interval.startTime);
    const end = parseTimeToMinutes(interval.endTime);

    if (start === null || end === null || end <= start) return;

    for (let minutes = start; minutes < end; minutes += 30) {
      slots.push(formatMinutesToDisplay(minutes));
    }
  });

  return Array.from(new Set(slots));
}

export function slotFitsIntervals(
  slotStart: string,
  duration: number,
  intervals: Array<{ startTime: string; endTime: string }>,
) {
  const start = parseTimeToMinutes(slotStart);

  if (start === null) return false;

  const end = start + duration;

  return intervals.some((interval) => {
    const intervalStart = parseTimeToMinutes(interval.startTime);
    const intervalEnd = parseTimeToMinutes(interval.endTime);

    return intervalStart !== null && intervalEnd !== null && start >= intervalStart && end <= intervalEnd;
  });
}

export function getSlotStatus(
  slotStart: string,
  duration: number,
  reservations: ReservationLike[],
  currentUserId?: string,
): SlotStatus {
  const overlap = getOverlappingReservations(slotStart, duration, reservations)[0];

  if (!overlap) return "available";

  return overlap.userId === currentUserId ? "mine" : "busy";
}

export function getAvailabilityForDate({
  date,
  weeklyAvailability,
  specialDates,
  courtActive = true,
  courtStatus = "available",
}: {
  date: string;
  weeklyAvailability: WeeklyAvailabilityLike[];
  specialDates: SpecialDateLike[];
  courtActive?: boolean;
  courtStatus?: string;
}): AvailabilityDecision {
  const normalizedStatus = courtStatus.toLowerCase();

  if (!courtActive || ["closed", "disabled", "inactive", "maintenance", "mantenimiento"].includes(normalizedStatus)) {
    return {
      available: false,
      reason: "La cancha no está disponible actualmente.",
      source: "maintenance",
      intervals: [],
    };
  }

  const day = new Date(`${date}T12:00:00`).getDay();
  const specialDate = specialDates.find((item) => item.date === date);
  const habitualIntervals = weeklyAvailability
    .filter((item) => item.dayOfWeek === day && item.active)
    .map((item) => ({ startTime: item.startTime, endTime: item.endTime }));

  if (specialDate) {
    if (!specialDate.available) {
      return {
        available: false,
        reason: specialDate.note || "Fecha especial bloqueada.",
        source: "special-closed",
        intervals: [],
      };
    }

    const specialStart = specialDate.startTime;
    const specialEnd = specialDate.endTime;
    const specialStartMinutes = parseTimeToMinutes(specialStart);
    const specialEndMinutes = parseTimeToMinutes(specialEnd);
    const specialInterval =
      specialStart && specialEnd && specialStartMinutes !== null && specialEndMinutes !== null && specialEndMinutes > specialStartMinutes
        ? [{ startTime: specialStart, endTime: specialEnd }]
        : habitualIntervals.length > 0
          ? habitualIntervals
          : [DEFAULT_SPECIAL_INTERVAL];

    return {
      available: true,
      reason: specialDate.note || "Fecha especial habilitada.",
      source: "special-open",
      intervals: specialInterval,
    };
  }

  if (habitualIntervals.length === 0) {
    return {
      available: false,
      reason: "La cancha está cerrada según su horario habitual.",
      source: "closed",
      intervals: [],
    };
  }

  return {
    available: true,
    reason: "Usando horario habitual de la cancha.",
    source: "habitual",
    intervals: habitualIntervals,
  };
}
