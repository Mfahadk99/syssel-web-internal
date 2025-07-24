"use client";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { useUpdateVoucher } from "@/app/hooks/useVoucher";
import toast from 'react-hot-toast';
import Image from 'next/image';

const SendVoucherModal = ({ setShowSendVoucherModal, currentId, voucherId, friends: friendsProfiles }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const updateVoucher = useUpdateVoucher();
  const dummyImage =
    "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

  const friends = friendsProfiles.map(profile => ({
    id: profile?._id,
    name: profile?.name || "No name found",
    avatar: Array.isArray(profile?.images) && profile.images.length > 0 ? profile.images[0] : dummyImage
  }));

  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend);
  };


  const handleSendVoucher = async () => {
    try {
      const updateData = {
        id: voucherId,
        buyers: {
          add: [selectedFriend.id],
          remove: [currentId]
        }
      };

      await updateVoucher.mutateAsync(updateData);
      
      toast.success('Voucher sent successfully!');

      setSelectedFriend(null);
      setIsOpen(false);
      setShowSendVoucherModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to send voucher:', error);
      toast.error('Failed to send voucher. Please try again.');
    }
  };

  if (!isOpen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Open Send Voucher Modal
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-auto overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 relative">
          <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 text-center">Send Voucher</h2>
          <button
            onClick={() => {
              setIsOpen(false);
              setShowSendVoucherModal(false);
            }}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Section */}
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Search for people</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none"
              placeholder="Search for people"
            />
          </div>
        </div>

        {/* Friends List */}
        <div className="px-6 pb-6 max-h-80 overflow-y-auto">
          <div className="space-y-2">
            {friends.map((friend, index) => (
              <div
                key={index}
                onClick={() => handleFriendSelect(friend)}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                  selectedFriend?.id === friend.id ? "bg-[#F5E6EE]" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative w-12 h-12 mr-3">
                  <Image 
                    src={friend.avatar} 
                    alt={friend.name} 
                    fill
                    className="rounded-full object-cover"
                    sizes="48px"
                  />
                </div>
                <span className="text-gray-800 font-medium">{friend.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Send Button */}
        {selectedFriend && (
          <div className="px-6 pb-6">
            <button
              onClick={handleSendVoucher}
              className="w-full bg-primary text-white py-4 rounded-full font-medium hover:bg-primary-hover transition-colors duration-300 cursor-pointer"
            >
              Send Voucher
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendVoucherModal;
