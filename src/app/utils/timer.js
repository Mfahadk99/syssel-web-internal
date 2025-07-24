import { useState, useEffect } from "react";

// Timer component that handles its own state
export const Timer = ({ endDate }) => {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      if (!endDate) return "";

      const end = new Date(endDate);
      const now = new Date();

      if (end < now) return "Expired";

      const diffInMs = end - now;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInHours = Math.floor(
        (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const diffInMinutes = Math.floor(
        (diffInMs % (1000 * 60 * 60)) / (1000 * 60)
      );
      const diffInSeconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

      return `${String(diffInDays).padStart(2, "0")}:${String(
        diffInHours
      ).padStart(2, "0")}:${String(diffInMinutes).padStart(2, "0")}:${String(
        diffInSeconds
      ).padStart(2, "0")}`;
    };

    // Initial calculation
    setTimeRemaining(calculateTime());

    // Update every second
    const timer = setInterval(() => {
      setTimeRemaining(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return timeRemaining;
};
