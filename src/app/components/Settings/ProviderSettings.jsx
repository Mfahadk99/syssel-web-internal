"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Heart, MessageSquare, X, Building2, Store, Plus } from "lucide-react";

export default function ProviderSettings() {
  // Settings data structure
  const [settings, setSettings] = useState({
    sections: [
      {
        title: "Verification",
        items: [{ id: 1, title: "Verification", icon: <CheckCircle size={22} className="text-gray-400" />, link: "#" }],
      },
      {
        title: "Customer experience",
        items: [
          { id: 2, title: "Loyalty program", icon: <Heart size={22} className="text-gray-400" />, link: "#" },
          { id: 3, title: "AI Assistant", icon: <MessageSquare size={22} className="text-gray-400" />, link: "#" },
          { id: 4, title: "Cancellation policy", icon: <X size={22} className="text-gray-400" />, link: "#" },
        ],
      },
      {
        title: "Information",
        items: [
          { id: 5, title: "Company information", icon: <Building2 size={22} className="text-gray-400" />, link: "#" },
        ],
      },
      {
        title: "Store settings",
        items: [
          {
            id: 6,
            title: "Connect to a registered store",
            icon: <Store size={22} className="text-gray-400" />,
            link: "#",
          },
          { id: 7, title: "Switch to store account", icon: <Store size={22} className="text-gray-400" />, link: "#" },
        ],
      },
    ],
  });

  // Menu item component
  const MenuItem = ({ title, icon, link }) => (
    <div className="cursor-pointer flex items-center justify-between bg-white p-4 mb-3 shadow-sm hover:shadow-md duration-300 options-border">
      <div className="flex items-center">
        <div className="flex items-center justify-center">{icon}</div>
        <span className="ml-3 text-gray-800 font-medium text-md">{title}</span>
      </div>
      <ChevronRight className="text-gray-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="flex items-center pt-6 px-6 pb-4">
        {/* <ChevronLeft className="text-gray-700 h-6 w-6" /> */}
        <h1 className="text-2xl font-bold text-gray-800 mx-auto">Provider Settings</h1>
      </div>

      {/* Content */}
      <div className="px-4">
        {settings.sections.map((section, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{section.title}</h2>
            <div>
              {section.items.map((item) => (
                <MenuItem key={item.id} title={item.title} icon={item.icon} link={item.link} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
