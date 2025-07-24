"use client";
import { useState } from "react";
import { Heart, Mail, Save } from "lucide-react";
import { HiMiniReceiptRefund } from "react-icons/hi2";
import { MdCancel } from "react-icons/md";
import Header from "../Header/Header";
import { ReusableInfoCard } from "../Reusable/Card";
import OptionsButton from "../Modals/Options/Options";
import { useRouter } from "next/navigation";

export default function ReceiptDetails({ data }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();

  const receiptData = {
    salon: {
      name: "Nati's Nails",
      initial: "N",
      date: "14/05/23 at 16:43",
    },
    order: {
      number: "28894",
      service: {
        title: "Full pedicure",
        description: "Choose from a wide variety of different colours and styles.",
        price: "599 kr",
        image:
          "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        distance: "200 meters",
      },
    },
    priceBreakdown: [
      { label: "MVA:", value: "0 kr" },
      { label: "Transaction fee:", value: "0%" },
      { label: "Service charge:", value: "599 kr" },
      { label: "Add-ons:", value: "0 kr" },
      { label: "Deposit return:", value: "0 kr" },
    ],
    total: "599 kr",
    payment: {
      method: "Visa ****8429",
      type: "VISA",
      date: "14/05/23, 1643",
      amount: "599 kr",
    },
    actions: [
      { label: "Send to Email", icon: Mail, isPrimary: false },
      { label: "Save as PDF", icon: Save, isPrimary: true },
    ],
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const filteredData = data.filter((item) => item._id === "1");

  const optionButtonsData = [
    {
      text: "Request Refund",
      icon: <HiMiniReceiptRefund size={22} />,
      onClick: () => router.push("/request-refund"),
      iconClassName: "text-gray-500",
    },
    {
      text: "Cancel",
      icon: <MdCancel size={22} />,
      onClick: () => console.log("Cancel clicked"),
      iconClassName: "text-gray-500",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Header
          heading={{ title: "Receipt Details" }}
          optionsButton={<OptionsButton buttons={optionButtonsData} title="Options" />}
        />
      </div>

      {/* Salon Info */}
      <div className="bg-white p-5 rounded-lg shadow-md m-5">
        <div className="p-6 flex items-center">
          <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mr-4">
            <div className="text-2xl font-bold text-yellow-500">{receiptData.salon.initial}</div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{receiptData.salon.name}</h2>
            <p className="text-gray-500">{receiptData.salon.date}</p>
          </div>
        </div>

        {/* Order Number */}
        <div className="px-4 py-2">
          <h3 className="text-2xl font-bold text-gray-800">
            Order <span className="text-gray-500 font-normal">#{receiptData.order.number}</span>
          </h3>
        </div>

        <ReusableInfoCard item={filteredData[0]} />

        {/* Price Breakdown */}
        <div className="px-4 py-4">
          {receiptData.priceBreakdown.map((item, index) => (
            <div key={index} className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-800">{item.label}</span>
              <span className="text-gray-800">{item.value}</span>
            </div>
          ))}

          <div className="flex justify-between py-4 font-bold text-xl">
            <span>Total</span>
            <span>{receiptData.total}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="px-4 py-2">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Payment Details</h3>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <div className="w-12 h-8 bg-blue-900 rounded flex items-center justify-center mr-4">
                <span className="text-white font-bold text-xs">{receiptData.payment.type}</span>
              </div>
              <div>
                <p className="text-primary font-semibold">{receiptData.payment.method}</p>
                <p className="text-gray-500 text-sm">{receiptData.payment.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg text-gray-600">{receiptData.payment.amount}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-8 flex gap-4">
          {receiptData.actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className={`cursor-pointer flex-1 ${
                  action.isPrimary
                    ? "bg-primary hover:bg-primary-hover transition-all duration-300 text-white"
                    : "border border-gray-300 text-gray-700 hover:border-primary hover:text-primary transition-all duration-300"
                } py-3 px-4 rounded-full flex items-center justify-center gap-2`}
              >
                <Icon size={18} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
