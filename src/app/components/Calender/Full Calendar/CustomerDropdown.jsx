import React, { useState, useRef, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
import DummyProfileImage from "../../../../../public/DummyProfileImage.png";

const CustomCustomerDropdown = ({ value, onChange, error, buyers = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedCustomer = buyers?.find((customer) => customer.id === value);
  const filteredCustomers = buyers?.filter(
    (customer) =>
      customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCustomerSelect = (customer) => {
    onChange(customer.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-50 border-0 rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between ${
          error ? "ring-2 ring-red-500" : "focus-within:ring-2 focus-within:ring-purple-500"
        }`}
      >
        <div className="flex items-center space-x-3 flex-1">
          {selectedCustomer ? (
            <>
              <img
                src={selectedCustomer?.coverImage}
                alt={DummyProfileImage}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 items-center justify-center text-sm font-medium hidden">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-gray-900 font-medium">{selectedCustomer.name}</div>
                <div className="text-gray-500 text-sm">{selectedCustomer.email}</div>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-gray-500">Select a customer</span>
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              autoFocus
            />
          </div>

          {/* Customer List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                >
                  <img
                    src={customer.coverImage}
                    alt={customer.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-medium">
                    {customer?.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium">{customer?.name}</div>
                    <div className="text-gray-500 text-sm">{customer?.email}</div>
                  </div>
                  {value === customer.id && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <div className="text-sm">No customers found</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <span className="text-red-500 text-sm mt-1 block">{error.message}</span>}
    </div>
  );
};

export default CustomCustomerDropdown;
