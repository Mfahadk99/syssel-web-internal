import React from "react";

const Ratings = ({ rating, showNumber = true, size = "text-2xl" }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={`${size} ${
            index < Math.floor(rating) ? "text-primary" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
      {showNumber && (
        <span className="ml-2 text-gray-600 text-sm">{rating}</span>
      )}
    </div>
  );
};

export default Ratings;
