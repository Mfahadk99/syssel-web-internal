import React from "react";
import Image from 'next/image';

const PurchaseMoreBids = () => {
  const bidPackages = [
    { bids: "3", price: "99" },
    { bids: "10", price: "199" },
    { bids: "25", price: "449" },
    { bids: "Unlimited", price: "499", description: "for this month" },
  ];

  return (
    <div className="flex  bg-gray-50 text-gray-900 m-10 rounded-3xl p-10 shadow-2xl relative">
      {/* Header Image */}
      <div className="flex w-full">
        <div className="w-[55%] bg-gray-800 rounded-3xl overflow-hidden relative">
          <Image
            src="/PurchaseMoreBids.png"
            alt="Purchase More Bids"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="w-[55%] flex flex-col items-center p-10 gap-5">
          <h1 className="text-3xl font-bold">You've run out of bids!</h1>
          <p className="text-gray-500 text-center">
            Purchase a new bid pack to <br /> answer more missions.
          </p>
          <div className="h-full w-full flex flex-col items-center gap-12">
            <div className="grid grid-cols-2 gap-12">
              {bidPackages.map((pack, index) => (
                <button
                  key={index}
                  className="flex flex-col pt-4 items-center gap-1 shadow-sm h-32 w-30 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative w-10 h-10">
                    <Image
                      src="/BidPack.png"
                      alt="Bid Pack"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-primary text-sm">
                    {pack.bids}{" "}
                    {pack.bids === "Unlimited" ? "bids" : "more bids"}
                    {pack.description && <br />}
                    {pack.description}
                  </p>
                  <p className="text-green-800 text-sm font-bold">
                    {pack.price} kr
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseMoreBids;
