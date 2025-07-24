"use client";
import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import Image from "next/image";

// Add debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Header = ({
  heading,
  showSearchBar = false,
  optionsButton,
  onSearch,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchQuery = useDebounce(searchInput, 500);

  // Call onSearch with debounced value - only when debounced value changes
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]); // Remove onSearch from dependency array to prevent re-renders

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="mx-auto sm:mx-0 flex text-5xl md:text-5xl font-bold text-brown justify-center md:justify-start">
          {heading.title}{" "}
          <p className="text-goldenNormal ml-3 text-5xl md:text-5xl">
            {heading?.subtitle || ""}
          </p>
        </div>
        {optionsButton && <div className="ml-auto">{optionsButton}</div>}
      </div>
      {showSearchBar && (
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4 mt-5">
          <div className="relative flex-grow w-full">
            <div className="relative bg-white inner-shadow-thin rounded-full p-2 px-2 flex items-center w-full">
              <div className="flex items-center sm:w-xl md:w-full justify-between flex-grow gap-4 mx-2">
                <div className="">
                  <FiSearch className="text-gray-700" />
                </div>
                <input
                  type="text"
                  placeholder="What do you need?"
                  className="text-lg w-full focus:outline-none outline-none"
                  value={searchInput}
                  onChange={handleSearch}
                />
                <button className="cursor-pointer">
                  <Image
                    src="/filter.svg"
                    alt="Filter"
                    width={20}
                    height={16}
                    className="w-5 h-4"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Header;
