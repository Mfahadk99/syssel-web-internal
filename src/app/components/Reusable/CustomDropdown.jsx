import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const CustomSelect = ({ 
  value, 
  onChange, 
  placeholder = "Select an option...", 
  children,
  className = "",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const dropdownRef = useRef(null);

  // Get selected option label
  useEffect(() => {
    if (value && children) {
      const childrenArray = React.Children.toArray(children);
      const selectedChild = childrenArray.find(child => child.props.value === value);
      if (selectedChild) {
        setSelectedLabel(selectedChild.props.children);
      }
    } else {
      setSelectedLabel('');
    }
  }, [value, children]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue, optionLabel) => {
    onChange(optionValue);
    setSelectedLabel(optionLabel);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-left
          shadow-sm hover:shadow-md transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-300'}
          ${isOpen ? 'ring-2 ring-blue-500 border-transparent shadow-lg' : ''}
        `}
      >
        <span className={`block truncate ${selectedLabel ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedLabel || placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <ChevronDown 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="max-h-60 overflow-auto py-1">
            {React.Children.map(children, (child) => {
              if (child.type === CustomOption) {
                return React.cloneElement(child, {
                  onSelect: handleSelect,
                  isSelected: child.props.value === value
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const CustomOption = ({ 
  value, 
  children, 
  onSelect, 
  isSelected = false,
  disabled = false,
  className = ""
}) => {
  return (
    <div
      onClick={() => !disabled && onSelect(value, children)}
      className={`
        relative px-4 py-3 cursor-pointer transition-all duration-150 ease-in-out
        hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
        ${className}
      `}
    >
      <span className="block truncate">{children}</span>
      {isSelected && (
        <Check className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
      )}
    </div>
  );
};