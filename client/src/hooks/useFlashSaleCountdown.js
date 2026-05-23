import { useEffect, useState } from "react";

const STORAGE_KEY = "novamart_flash_sale_end";

/** 20 days, 22 hours, 45 minutes, 50 seconds */
const INITIAL_DURATION_MS =
  ((20 * 24 + 22) * 60 * 60 + 45 * 60 + 50) * 1000;

function getOrCreateEndTimestamp() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? Number(stored) : NaN;
    if (Number.isFinite(parsed) && parsed > Date.now()) {
      return parsed;
    }
  } catch {
    /* localStorage unavailable */
  }

  const end = Date.now() + INITIAL_DURATION_MS;
  try {
    localStorage.setItem(STORAGE_KEY, String(end));
  } catch {
    /* ignore */
  }
  return end;
}

function getRemaining(endTimestamp) {
  const diff = Math.max(0, endTimestamp - Date.now());

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);

  return { days, hours, minutes, seconds, expired: diff === 0 };
}

function pad(value) {
  return String(value).padStart(2, "0");
}

export default function useFlashSaleCountdown() {
  const [endTimestamp] = useState(() => getOrCreateEndTimestamp());
  const [remaining, setRemaining] = useState(() => getRemaining(endTimestamp));

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(endTimestamp));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endTimestamp]);

  return {
    days: pad(remaining.days),
    hours: pad(remaining.hours),
    minutes: pad(remaining.minutes),
    seconds: pad(remaining.seconds),
    expired: remaining.expired,
  };
}
