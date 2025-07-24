"use client";
import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, X } from 'lucide-react';

const OptionsModal = ({ 
  isOpen, 
  onClose, 
  title = "Options", 
  buttons = [],
  trigger
}) => {
  const modalRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return trigger;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <div className="space-y-2">
              {buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => {
                    button.onClick();
                    if (button.closeOnClick !== false) {
                      onClose();
                    }
                  }}
                  className={`text-lg cursor-pointer flex items-center w-full text-left px-3 py-3 rounded-md hover:bg-gray-100 transition-colors ${button.className || ''}`}
                >
                  {button.icon && (
                    <span className={`text-primary cursor-pointer mr-3 ${button.iconClassName || ''}`}>
                      {button.icon}
                    </span>
                  )}
                  <span className={button.textClassName || ''}>{button.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Button that opens the options modal
const OptionsButton = ({ 
  buttons = [], 
  title = "Options", 
  icon = null, 
  iconClassName = "h-5 w-5 text-gray-600" 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const IconComponent = icon || MoreVertical;

  const trigger = (
    <button
      onClick={openModal}
      className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="More options"
    >
      <IconComponent className={iconClassName} />
    </button>
  );

  return (
    <OptionsModal
      isOpen={isOpen}
      onClose={closeModal}
      title={title}
      buttons={buttons}
      trigger={trigger}
    />
  );
};

export { OptionsModal, OptionsButton };
export default OptionsButton;