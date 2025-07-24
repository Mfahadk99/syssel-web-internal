"use client";
import React, { useState, useRef, useEffect } from "react";
import Header from "../Header/Header";
import { VoucherCard } from "../Reusable/Card";
import SendVoucherModal from "./SendVoucher";

// Simple Dropdown Component
const VoucherDropdown = ({ isOpen, position, onClose, selectedVoucher, onSendToFriend }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`fixed bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[160px] transform transition-all duration-200 ease-out ${
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="py-1">
        <button
          onClick={() => onSendToFriend(selectedVoucher)}
          className="cursor-pointer w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
        >
          Send to Friend
        </button>

        <hr className="border-gray-100" />

        <button
          onClick={onClose}
          className="cursor-pointer w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const Vouchers = ({ data, currentId, friends }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [showSendVoucherModal, setShowSendVoucherModal] = useState(false);

  const handleVoucherClick = (event, voucher) => {
    event.preventDefault();

    // Get click position
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY + 10; // Add small offset below cursor

    // Adjust position if dropdown would go off screen
    const dropdownWidth = 160;
    const dropdownHeight = 100;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + dropdownWidth > viewportWidth) {
      adjustedX = x - dropdownWidth;
    }

    // Adjust vertical position
    if (y + dropdownHeight > viewportHeight) {
      adjustedY = y - dropdownHeight - 20;
    }

    setDropdownPosition({ x: adjustedX, y: adjustedY });
    setSelectedVoucher(voucher);
    setIsDropdownOpen(true);
  };

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
    setSelectedVoucher(null);
    setShowSendVoucherModal(false);
  };

  const handleSendToFriend = (voucher) => {
    // Close dropdown and show modal
    handleCloseDropdown();
    setSelectedVoucher(voucher);
    setShowSendVoucherModal(true);
  };

  return data.length > 0   ? (
    <div className="w-[95%] mx-auto my-5">
      <Header heading={{ title: "Vouchers" }} showSearchBar={false} />
      <div className="space-y-4 mt-10">
        {data?.map((item, index) => (
          <div key={index} onClick={(e) => handleVoucherClick(e, item)} className="cursor-pointer">
            <VoucherCard data={item} />
          </div>
        ))}
      </div>

      {/* Dropdown */}
      <VoucherDropdown
        isOpen={isDropdownOpen}
        position={dropdownPosition}
        onClose={handleCloseDropdown}
        selectedVoucher={selectedVoucher}
        onSendToFriend={handleSendToFriend}
      />

      {/* SendVoucherModal */}
      {showSendVoucherModal && selectedVoucher && (
        <SendVoucherModal
          setShowSendVoucherModal={setShowSendVoucherModal}
          currentId={currentId}
          voucherId={selectedVoucher._id}
          friends={friends}
        />
      )}
    </div>
  ) : (
    <div className="w-[95%] mx-auto my-5">
      <Header heading={{ title: "Vouchers" }} showSearchBar={false} />
      <div className="p-[20%] text-center">
        <p className="text-gray-500 text-xl">You don't have any vouchers yet.</p>
      </div>
    </div>
  );
};

export default Vouchers;
