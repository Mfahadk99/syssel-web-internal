import React, { useState, useRef, useEffect } from "react";
import { Scissors, Clock, DollarSign, ChevronDown } from "lucide-react";
import { formatDuration, formatPrice } from "@/app/utils/Calculations";

const CustomServiceDropdown = ({ value, onChange, error, services = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedService = services.find((service) => service.id === value);
  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleServiceSelect = (service) => {
    onChange(service.id);
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
          {selectedService ? (
            <>
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <Scissors className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-gray-900 font-medium">{selectedService.name}</div>
                <div className="text-gray-500 text-sm flex items-center space-x-2">
                  {selectedService.duration && (
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(selectedService.duration)}
                    </span>
                  )}
                  {selectedService.price && (
                    <span className="flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {formatPrice(selectedService.price)}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Scissors className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-gray-500">Select a service</span>
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
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              autoFocus
            />
          </div>

          {/* Service List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredServices.length > 0 ? (
              filteredServices.map((service, index) => (
                <div
                  key={service.id || index}
                  onClick={() => handleServiceSelect(service)}
                  className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-medium truncate">{service.name}</div>
                    {service.description && (
                      <div className="text-gray-500 text-sm mt-1 line-clamp-2">{service.description}</div>
                    )}
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-600">
                      {service.duration && (
                        <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(service.duration)}
                        </span>
                      )}
                      {service.price && (
                        <span className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {formatPrice(service.price)}
                        </span>
                      )}
                    </div>
                  </div>
                  {value === service.id && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Scissors className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <div className="text-sm">No services found</div>
                <div className="text-xs text-gray-400 mt-1">Try adjusting your search</div>
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

export default CustomServiceDropdown;
