"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-2 md:gap-6">
        {["Days", "Hours", "Min", "Sec"].map((label) => (
          <div key={label} className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 md:p-4 min-w-[60px] md:min-w-[90px]">
              <span className="text-2xl md:text-5xl font-bold">--</span>
            </div>
            <span className="text-xs md:text-base mt-1 md:mt-2 block opacity-80">
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 md:gap-6">
      <TimeUnit value={timeLeft.days} label="Days" mobileLabel="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" mobileLabel="Hrs" />
      <TimeUnit value={timeLeft.minutes} label="Minutes" mobileLabel="Min" />
      <TimeUnit value={timeLeft.seconds} label="Seconds" mobileLabel="Sec" />
    </div>
  );
}

function TimeUnit({ value, label, mobileLabel }: { value: number; label: string; mobileLabel: string }) {
  return (
    <div className="text-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 md:p-4 min-w-[60px] md:min-w-[90px]">
        <span className="text-2xl md:text-5xl font-bold">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs md:text-base mt-1 md:mt-2 block opacity-80">
        <span className="md:hidden">{mobileLabel}</span>
        <span className="hidden md:inline">{label}</span>
      </span>
    </div>
  );
}
