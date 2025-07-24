import React from "react";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import Header from "../Header/Header";

const receiptsData = [
  {
    id: 1,
    category: "Today",
    items: [
      {
        id: 101,
        image:
          "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        name: "Nati's Nails",
        date: "14/05/23",
        amount: "599 kr",
        bgColor: "bg-black",
      },
    ],
  },
  {
    id: 2,
    category: "This Week",
    items: [
      {
        id: 201,
        image:
          "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        name: "Sakura Massage Studio",
        date: "11/05/23",
        amount: "899 kr",
        bgColor: "bg-amber-900",
      },
      {
        id: 202,
        image:
          "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        name: "Åmundsen Elektro",
        date: "07/05/23",
        amount: "1 589 kr",
        bgColor: "bg-blue-900",
      },
      {
        id: 203,
        image:
          "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        name: "Simen Ruud Fotografi",
        date: "04/05/23",
        amount: "2 000 kr",
        bgColor: "bg-zinc-800",
      },
    ],
  },
  {
    id: 3,
    category: "Older",
    items: [
      {
        id: 301,
        image:
          "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        name: "Prive Hair",
        date: "19/04/23",
        amount: "899 kr",
        bgColor: "bg-stone-200",
      },
      {
        id: 302,
        image:
          "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        name: "Timeless Tattoo",
        date: "14/04/23",
        amount: "12 000 kr",
        bgColor: "bg-zinc-900",
      },
      {
        id: 303,
        image:
          "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        name: "Bislett Gym",
        date: "18/03/23",
        amount: "900 kr",
        bgColor: "bg-blue-800",
      },
      {
        id: 304,
        image:
          "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        name: "Mads Larsen Web & IT",
        date: "12/03/23",
        amount: "6 000 kr",
        bgColor: "bg-amber-100",
      },
    ],
  },
];

const Receipts = () => {
  return (
    <div className="text-gray-800">
      {/* Header */}
      <Header heading={{title: "Receipts"}} showSearchBar={false}/>

      {/* Receipt Categories */}
      <div className="mt-10">
        {receiptsData.map((category) => (
          <div key={category.id} className="mb-6">
            <h2 className="text-2xl font-bold mb-4">{category.category}</h2>

            {category.items.map((receipt) => (
              <div
                key={receipt.id}
                className="cursor-pointer flex h-26 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 mb-4"
              >
                {/* Logo container - Matching ReusableInfoCard dimensions */}
                <div
                  className={`relative h-26 w-44 flex-shrink-0 ${receipt.bgColor} rounded-l-2xl flex items-center justify-center`}
                >
                  {receipt.id === 101 ? (
                    <div className="relative">
                      <Image src={receipt.image} alt={receipt.name} fill className="object-cover rounded-l-2xl " />
                    </div>
                  ) : (
                    <Image src={receipt.image} alt={receipt.name} fill className="object-cover rounded-l-2xl" />
                  )}
                </div>

                {/* Content container */}
                <div className="p-4 flex-grow flex flex-col justify-center">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-purple-800">{receipt.name}</h3>
                      <p className="text-gray-600 mt-1">{receipt.date}</p>
                    </div>
                    <div className="text-xl font-semibold">{receipt.amount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Receipts;
