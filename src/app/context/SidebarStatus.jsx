"use client";
import React, { createContext, useContext, useState } from "react";

const SidebarStatusContext = createContext();

export const useSidebarStatus = () => {
  const context = useContext(SidebarStatusContext);
  if (!context) {
    throw new Error("useSidebarStatus must be used within a SidebarStatusProvider");
  }
  return context;
};

export const SidebarStatusProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  const value = {
    isOpen,
    isMobileOpen,
    setIsOpen,
    setIsMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
  };

  return (
    <SidebarStatusContext.Provider value={value}>
      {children}
    </SidebarStatusContext.Provider>
  );
};
