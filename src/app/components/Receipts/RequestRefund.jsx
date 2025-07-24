"use client";
import { useState } from "react";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RequestRefund() {
  const router = useRouter();
  const [reason, setReason] = useState("I have changed my mind");
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);

  const reasonOptions = [
    "I have changed my mind",
    "Service not as described",
    "Poor quality service",
    "Appointment scheduling issue",
    "Other",
  ];

  const orderData = {
    number: "#28894",
    salon: {
      name: "Nati's Nails",
      date: "14/05/23",
      logo: "N",
    },
    price: "599 kr",
    priceBreakdown: [
      { label: "MVA:", value: "0 kr" },
      { label: "Transaction fee:", value: "0%" },
      { label: "Service charge:", value: "599 kr" },
      { label: "Cancellation fee:", value: "50%" },
    ],
    refundAmount: "299,50 kr",
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="p-4 flex items-center">
        <h1 className="text-2xl font-bold text-center flex-1 mr-6">Request refund</h1>
      </div>

      <div className="bg-white min-h-screen p-5 m-5 rounded-lg shadow-md">
        {/* Order Info */}
        <div className="p-4">
          <div className="mb-4">
            <p className="text-gray-600 text-lg">
              Order <span className="text-gray-800">{orderData.number}</span>
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center mb-6">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4">
              <div className="text-xl font-bold text-yellow-500">{orderData.salon.logo}</div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">{orderData.salon.name}</h2>
              <p className="text-gray-500 text-sm">{orderData.salon.date}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{orderData.price}</p>
            </div>
          </div>

          {/* Reason Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Reason for refund</h3>
            <div className="relative">
              <div
                className="bg-white rounded-full p-4 flex justify-between items-center border border-gray-300 hover:shadow-sm cursor-pointer duration-300 transition-all"
                onClick={() => setShowReasonDropdown(!showReasonDropdown)}
              >
                <span className="text-gray-800">{reason}</span>
                <ChevronDown size={20} className="text-gray-500" />
              </div>

              {showReasonDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200">
                  {reasonOptions.map((option, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setReason(option);
                        setShowReasonDropdown(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 border-b border-gray-200 pb-2">Summary</h3>
            {orderData.priceBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-800">{item.label}</span>
                <span className="text-gray-800">{item.value}</span>
              </div>
            ))}

            <div className="flex justify-between py-4 font-bold text-xl">
              <span>Total refund amount</span>
              <span>{orderData.refundAmount}</span>
            </div>
          </div>

          {/* Request Button */}
          <button className="cursor-pointer w-full bg-primary text-white py-4 rounded-full font-medium shadow-md hover:bg-primary-hover duration-300 transition-colors">
            Request Refund
          </button>
        </div>
      </div>
    </div>
  );
}
