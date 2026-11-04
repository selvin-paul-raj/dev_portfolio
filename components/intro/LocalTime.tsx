"use client";

import { useEffect, useState } from "react";

const format = (now: Date) => {
  const h = now.getHours();
  const m = now.getMinutes();
  return `${h % 12 || 12}:${m < 10 ? "0" : ""}${m} ${h >= 12 ? "PM" : "AM"}`;
};

/** Live clock for the status pill. Fixed width and tabular digits so filling it in after hydration doesn't shift the pill. */
export default function LocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  return <span className="inline-block min-w-[8ch] text-left tabular-nums">{time}</span>;
}
