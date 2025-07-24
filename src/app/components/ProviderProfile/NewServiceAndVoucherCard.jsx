import React from "react";
import { Plus } from "lucide-react";

const NewServiceAndVoucherCard = ({ onVoucherClick, onServiceClick }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {/* New Voucher Card */}
      <div
        onClick={onVoucherClick}
        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
      >
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg mb-3">
          <Plus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-center font-medium">New Voucher</h3>
      </div>

      {/* New Service Card */}
      <div
        onClick={onServiceClick}
        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
      >
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg mb-3">
          <Plus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-center font-medium">New Service</h3>
      </div>
    </div>
  );
};

export default NewServiceAndVoucherCard;
