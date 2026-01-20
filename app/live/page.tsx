"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

function FlipDigit({ digit, prevDigit }: { digit: string; prevDigit: string }) {
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (digit !== prevDigit) {
      setIsFlipping(true);
      const timer = setTimeout(() => setIsFlipping(false), 600);
      return () => clearTimeout(timer);
    }
  }, [digit, prevDigit]);

  return (
    <div className="relative w-[80px] h-[120px] md:w-[120px] md:h-[180px] lg:w-[160px] lg:h-[240px] mx-1 md:mx-2">
      {/* Card container with perspective */}
      <div className="relative w-full h-full" style={{ perspective: "400px" }}>
        {/* Static bottom half (shows new digit) */}
        <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tabular-nums">
              {digit}
            </span>
          </div>
          {/* Middle line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-black/40" />
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-1/2" />
        </div>

        {/* Flipping top half */}
        {isFlipping && (
          <>
            {/* Upper card flipping down (shows old digit) */}
            <div
              className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden rounded-t-xl bg-gradient-to-b from-gray-700 to-gray-800 shadow-lg origin-bottom"
              style={{
                animation: "flipTop 0.3s ease-in forwards",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="absolute inset-0 flex items-end justify-center">
                <span className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tabular-nums translate-y-1/2">
                  {prevDigit}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
            </div>

            {/* Lower card flipping up (shows new digit) */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden rounded-b-xl bg-gradient-to-t from-gray-900 to-gray-800 shadow-lg origin-top"
              style={{
                animation: "flipBottom 0.3s ease-out 0.3s forwards",
                backfaceVisibility: "hidden",
                transform: "rotateX(90deg)",
              }}
            >
              <div className="absolute inset-0 flex items-start justify-center">
                <span className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tabular-nums -translate-y-1/2">
                  {digit}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Side shadows for 3D effect */}
      <div className="absolute inset-y-2 -left-1 w-2 bg-gradient-to-r from-black/20 to-transparent rounded-l-xl" />
      <div className="absolute inset-y-2 -right-1 w-2 bg-gradient-to-l from-black/20 to-transparent rounded-r-xl" />
    </div>
  );
}

function FlipCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setPrevValue(prevValueRef.current);
      setDisplayValue(value);
      prevValueRef.current = value;
    }
  }, [value]);

  // Dynamic digit count based on value
  const getDigitCount = (val: number) => {
    if (val < 100) return 2;
    if (val < 1000) return 3;
    return 4;
  };

  const digitCount = getDigitCount(Math.max(displayValue, prevValue));
  const digits = displayValue.toString().padStart(digitCount, "0").split("");
  const prevDigits = prevValue.toString().padStart(digitCount, "0").split("");

  return (
    <div className="flex justify-center items-center">
      {digits.map((digit, index) => (
        <FlipDigit
          key={`${digitCount}-${index}`}
          digit={digit}
          prevDigit={prevDigits[index]}
        />
      ))}
    </div>
  );
}

export default function LiveStatsPage() {
  const [checkedIn, setCheckedIn] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource("/api/public/stats/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setCheckedIn(data.checkedIn);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-vodafone-gradient flex flex-col items-center p-4 md:p-8 overflow-hidden">
      {/* CSS for flip animations */}
      <style jsx global>{`
        @keyframes flipTop {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(-90deg);
          }
        }

        @keyframes flipBottom {
          0% {
            transform: rotateX(90deg);
          }
          100% {
            transform: rotateX(0deg);
          }
        }
      `}</style>

      {/* Top Section - Logo & Title */}
      <div className="flex-1 flex flex-col items-center justify-end pb-6 md:pb-10">
        {/* Vodafone Logo */}
        <div className="mb-4 md:mb-6">
          <Image
            src="/images/vodafone-logo-white.png"
            alt="Vodafone"
            width={200}
            height={54}
            className="object-contain w-[120px] md:w-[180px] h-auto"
            priority
          />
        </div>

        {/* Event Title */}
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-2">
            Sports Village 2026
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-white/80">
            National Sport Day - 10 February 2026
          </p>
        </div>
      </div>

      {/* Center Section - Counter (the main focus) */}
      <div className="py-6 md:py-10">
        <FlipCounter value={checkedIn} />
      </div>

      {/* Bottom Section - Label */}
      <div className="flex-1 flex flex-col items-center justify-start pt-6 md:pt-10">
        <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-white tracking-wider uppercase">
          Checked In
        </p>
      </div>
    </div>
  );
}
