"use client"

import { useEffect, useState } from "react";

interface Props {
  targetDate: string; // (e.g. "2025-11-28T23:59:59")
}

export default function Countdown({ targetDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetTime = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const timeDifference = targetTime - now;

      if (timeDifference > 0) {
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
        const seconds = Math.floor((timeDifference  / 1000) % 60);

        setTimeLeft({days, hours, minutes, seconds});
      } else {
        setTimeLeft({days: 0, hours: 0, minutes: 0, seconds: 0});
      }
    }

    // initial calculation to avoid 1000ms delay of the interval
    calculateTimeLeft();

    const interval = setInterval(() => {
      calculateTimeLeft()
    }, 1000);
  
    return () => {
     clearInterval(interval);
    }
  }, [targetDate])
  
  return (
    <div className="text-orange-background leading-4">
      <div className="inline-block text-sm">
        <span className="mr-1">Ends in:</span>
        <div className="inline-block">
          <span className="bg-orange-background text-white min-w-6 p-0 rounded-[2px] inline-block min-h-4 text-center">
            {timeLeft.days.toString().padStart(2, "0")}
          </span>
          <span className="mx-1">:</span>
          <span className="bg-orange-background text-white min-w-6 p-0 rounded-[2px] inline-block min-h-4 text-center">
            {timeLeft.hours.toString().padStart(2, "0")}
          </span>
          <span className="mx-1">:</span>
          <span className="bg-orange-background text-white min-w-6 p-0 rounded-[2px] inline-block min-h-4 text-center">
            {timeLeft.minutes.toString().padStart(2, "0")}
          </span>
          <span className="mx-1">:</span>
          <span className="bg-orange-background text-white min-w-6 p-0 rounded-[2px] inline-block min-h-4 text-center">
            {timeLeft.seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
