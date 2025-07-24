import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const SlidingButtons = ({
  buttons,
  activeButton,
  setActiveButton,
  className = "",
  buttonClassName = "",
  activeButtonClassName = "text-white",
  inactiveButtonClassName = "text-gray-500 hover:text-gray-700",
  breakpoint = "md", // The breakpoint at which to switch to dropdown ('sm', 'md', 'lg', etc.)
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Find the active button data
  const activeButtonData = buttons.find((button) => button.id === activeButton) || buttons[0];
  
  // Only convert to dropdown when more than 3 buttons
  const showDropdown = buttons.length > 3;

  return (
    <>
      {/* Mobile Dropdown (hidden on larger screens or when <= 3 buttons) */}
      {showDropdown && (
        <div className={`relative ${breakpoint}:hidden ml-0 max-w-fit`} ref={dropdownRef}>
          <div
            className={`relative flex justify-between items-center bg-white rounded-full p-1.5 cursor-pointer inner-shadow-thin ${className}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex text-white items-center gap-2 py-1 px-4 font-medium bg-primary rounded-full">
              {activeButtonData?.icon && (
                <span className="text-base relative z-10">
                  <activeButtonData.icon />
                </span>
              )}
              <span className="whitespace-nowrap relative z-10">{activeButtonData?.label}</span>
            <ChevronDown
              className={`w-4 h-4 mr-2 transition-transform relative z-10 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
              </div>
            <motion.div
              layoutId="mobileButtonIndicator"
              className="absolute inset-0 rounded-full z-0"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg overflow-hidden z-20">
              {buttons.map((button) => (
                <div
                  key={button.id}
                  className={`flex items-center gap-2 p-3 cursor-pointer ${
                    activeButton === button.id ? "bg-primary/10" : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setActiveButton(button.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  {button.icon && (
                    <span className={`text-base ${activeButton === button.id ? "text-primary" : "text-gray-500"}`}>
                      <button.icon />
                    </span>
                  )}
                  <span className={`${activeButton === button.id ? "text-primary font-medium" : "text-gray-700"}`}>
                    {button.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sliding Buttons (hidden on small screens when > 3 buttons, always visible when <= 3 buttons) */}
      <div
        className={`relative ${showDropdown ? `hidden ${breakpoint}:flex` : 'flex'} flex-wrap justify-center bg-white rounded-full p-1.5 max-w-fit mx-auto inner-shadow-thin ${className}`}
      >
        {buttons.map((button) => (
          <motion.button
            key={button.id}
            onClick={() => setActiveButton(button.id)}
            className={`relative z-10 flex items-center justify-center gap-1 sm:gap-2 py-1 px-4 sm:px-1 md:px-5 rounded-full transition-colors duration-300 text-xs sm:text-sm md:text-base font-medium ${buttonClassName} ${
              activeButton === button.id ? activeButtonClassName : inactiveButtonClassName
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {activeButton === button.id && (
              <motion.div
                layoutId="buttonIndicator"
                className="absolute inset-0 bg-primary rounded-full z-0"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {button.icon && (
              <span className="relative z-10 text-sm sm:text-base md:text-xl">
                <button.icon />
              </span>
            )}
            <span className="relative z-10 whitespace-nowrap">{button.label}</span>
          </motion.button>
        ))}
      </div>
    </>
  );
};

export default SlidingButtons;
