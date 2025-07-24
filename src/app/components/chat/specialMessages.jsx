import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectCards } from "swiper/modules";
import {
  CreditCard as CreditCardIcon,
  CheckCircle2,
  CircleDot,
  XCircle,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  X,
  Heart,
} from "lucide-react";
import { FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-cards";
import Image from "next/image";
import useAuthStore from "../../store/useAuthStore";
import { useUpdateBooking } from "../../hooks/useBooking";
import toast from "react-hot-toast";
import CardWrapper from "../Reusable/CardWrapper";
import { useCreateReview, useUpdateReview } from "../../hooks/useReview";
import { useUpdateMessage } from "../../hooks/useChat";
import { useForm } from "react-hook-form";
import useImageUploader from "../../utils/imgUpload";

export const OrderModal = ({ isOpen, onClose, orderData, pov }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Extract slot/session info from orderData

  const [amount, setAmount] = useState(orderData?.totalPrice || 0);
  const [date, setDate] = useState(orderData?.sessionDate || "");
  const sessionTime = orderData?.sessionTime || "";
  let initialStartTime = "";
  let initialEndTime = "";
  // console.log(amount , "dattttttt")

  if (sessionTime.includes("-")) {
    [initialStartTime, initialEndTime] = sessionTime
      .split("-")
      .map((s) => s.trim());
  }

  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);

  // Update state when orderData changes (for fresh edit each time)
  useEffect(() => {
    setAmount(orderData?.totalPrice || 0);
    setDate(orderData?.sessionDate || "");
    setStartTime(initialStartTime);
    setEndTime(initialEndTime);
  }, [orderData]);

  const updateBooking = useUpdateBooking(orderData?._id);

  const handleSave = () => {
    if (!date || !startTime || !endTime) {
      toast.error("Please fill all session time fields.");
      return;
    }

    updateBooking.mutate(
      {
        slot: {
          date,
          startTime,
          endTime,
        },
        amount: Number(amount),
      },

      {
        onSuccess: (data) => {
          console.log("onSuccess", data);
          toast.success("Order updated successfully!");
          setIsEditing(false);
          onClose();
        },
        onError: (error) => {
          console.log("onError", error);
          toast.error("Failed to update the order.");
        },
      }
    );
  };

  if (!isOpen) return null;

  // console.log("orderDataaaa", orderData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Order</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Service:</p>
              <p className="font-medium">{orderData.project}</p>
            </div>
            <div className="border-b border-gray-300 my-2"></div>

            {/* Session Time */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Session Time</p>
              {isEditing ? (
                <div className="flex flex-col items-end gap-2 text-gray-600">
                  <div>
                    <input
                      type="date"
                      className="border rounded p-1"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <p className="font-medium">
                  {orderData.sessionTime === ""
                    ? "Request Time"
                    : orderData.sessionTime}
                </p>
              )}
            </div>
            {isEditing && (
              <div className="flex justify-end pt-2 text-gray-600">
                <div className="flex gap-4 items-center justify-between">
                  <div className="flex gap-1 items-center">
                    <p>Start time</p>
                    <input
                      type="time"
                      className="border rounded p-1"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>

                  <div className="flex  gap-1 items-center">
                    <p>End time</p>
                    <input
                      type="time"
                      className="border rounded p-1"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="border-b border-gray-300 my-2"></div>

            {/* Total Price */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Total Price:</p>
              {isEditing ? (
                <input
                  type="text"
                  className="border rounded p-1 w-24 text-gray-600"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              ) : (
                <p className="font-medium">
                  {orderData.totalPrice === 0
                    ? "Request Price"
                    : orderData.totalPrice}
                </p>
              )}
            </div>
            <div className="border-b border-gray-300 my-2"></div>
          </div>

          {orderData.comment && (
            <div className="space-y-2">
              <p className="text-gray-600">Comments:</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{orderData.comment}</p>
              </div>
            </div>
          )}
          {orderData.addons && orderData.addons.length > 0 && (
            <div className="space-y-2">
              <p className="text-gray-600">Addons:</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  {orderData.addons
                    .map(
                      (addon) =>
                        `${addon.quantity}x ${addon.name} ${addon.price}`
                    )
                    .join(", ")}
                </p>
              </div>
            </div>
          )}
          <div className="border-b border-gray-300 my-2"></div>

          {orderData.images && orderData.images.length > 0 && (
            <div className="space-y-2">
              <p className="text-gray-600">Pictures:</p>
              <div className="flex gap-2">
                {orderData.images.map((img, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 rounded-lg overflow-hidden"
                    onClick={() => window.open(img, "_blank")}
                  >
                    <Image
                      src={img}
                      alt={`Reference ${index + 1}`}
                      className="object-cover"
                      width={64}
                      height={64}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex gap-1">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-l-full"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-primary text-white py-3 rounded-r-full"
              >
                Save
              </button>
            </>
          ) : pov === "buyer" ? (
            <button
              onClick={onClose}
              className="flex-1 bg-primary text-white hover:bg-primary/90 py-3 rounded-full"
            >
              Cancel Order
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 bg-primary text-white hover:bg-primary/90 py-3 rounded-l-full"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-primary text-white hover:bg-primary/90 py-3 rounded-r-full"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const OrderCard = ({ Data, onCancel, onView }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentProfile } = useAuthStore();
  const pov = currentProfile?.profileType;
  const updateBooking = useUpdateBooking(Data.orderData?._id);
  const [isAccepted, setIsAccepted] = useState(Data.orderData.isAccepted);

  const handleView = () => {
    setIsModalOpen(true);
    if (onView) onView();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAccept = () => {
    updateBooking.mutate(
      { isAccepted: "true", status: "confirmed" },
      {
        onSuccess: () => {
          setIsAccepted(true);
          toast.success("Order accepted successfully!");
        },
      }
    );
  };

  const handleCancel = () => {
    updateBooking.mutate(
      { isAccepted: "false", status: "cancelled" },
      {
        onSuccess: () => {
          setIsAccepted(false);
          toast.success("Order cancelled successfully!");
        },
      }
    );
  };

  console.log("Dataaa1", Data);

  return (
    <>
      <div
        className={` rounded-3xl overflow-hidden text-secondary shadow-gray-300 shadow-md w-60 sm:w-80 ${
          Data.sender === "user"
            ? "bg-[#F2E2D4] rounded-br-none"
            : "bg-[#FBF2EC] rounded-bl-none"
        }`}
      >
        <div className="py-4 px-5">
          <h2 className="text-lg font-semibold">Order</h2>
          <p className="text-md font-medium">
            {Data.orderData.customer} - {Data.orderData.project}
          </p>

          <div className="mt-2">
            <h3 className="text-lg font-semibold ">Session Time</h3>
            <p className="text-md font-medium">
              {Data.orderData.sessionTime || "Request Time"}
            </p>
          </div>

          {/* <div className="mt-2">
            <h3 className="text-lg font-semibold ">Request Time</h3>
            <p className="text-md font-medium">{Data.orderData.requestTime}</p>
          </div> */}

          <div className="mt-2">
            <h3 className="text-lg font-semibold ">Total Price</h3>
            <p className="text-md font-medium">
              {Data.orderData.totalPrice > "0"
                ? Data.orderData.totalPrice
                : "Request Price"}
            </p>
          </div>

          {/* <div className="mt-2">
            <h3 className="text-lg font-semibold ">Request Price</h3>
            <p className="text-md font-medium">{Data.orderData.requestPrice}</p>
          </div> */}

          <div className="mt-2">
            <h3 className="text-lg font-semibold ">Comments</h3>
            <p className="text-md truncate font-medium">
              {Data.orderData.comment}
            </p>
          </div>

          <div className="mt-2">
            <h3 className="text-lg font-semibold ">Add-ons</h3>
            {Data.orderData.addons.map((addon, index) => (
              <p key={index} className="text-md font-medium">
                {addon.quantity}x {addon.name} {addon.price}
              </p>
            ))}
          </div>

          {Data.orderData.images && Data.orderData.images.length > 0 && (
            <div className="mt-2">
              <h3 className="text-lg font-semibold ">Attached Images</h3>
              <div className="flex mt-1">
                {Data.orderData.images.slice(0, 3).map((img, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-full overflow-hidden -ml-2 first:ml-0 border relative"
                  >
                    <Image
                      src={img}
                      alt="Attached"
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ))}
                {Data.orderData.images.length > 3 && (
                  <div className="w-10 h-10 rounded-full -ml-2 bg-white border flex items-center justify-center">
                    <span className="text-md ">
                      +{Data.orderData.images.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 grid  rounded-full grid-cols-2 gap-1">
            {Data.sender === "user" ? (
              <>
                <button
                  onClick={onCancel}
                  className="bg-primary cursor-pointer text-white rounded-l-full py-2 "
                >
                  Cancel
                </button>
                <button
                  onClick={handleView}
                  className="bg-primary cursor-pointer text-white rounded-r-full py-2 "
                >
                  View
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleView}
                  className="bg-primary cursor-pointer text-white py-2 rounded-l-full"
                >
                  Manage
                </button>
                {isAccepted !== true ? (
                  <button
                    onClick={handleAccept}
                    className="bg-primary cursor-pointer text-white py-2 rounded-r-full"
                  >
                    Accept
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    className="bg-primary cursor-pointer text-white py-2 rounded-r-full"
                  >
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        orderData={Data.orderData}
        pov={pov}
      />
    </>
  );
};

export const ReceiptModal = ({ isOpen, onClose, paymentData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* Close button (X) */}
        <div className="flex justify-end p-3">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Header */}
        <div className="px-6 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Receipt
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 space-y-4">
          {/* <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Receipt Number</p>
              <p className="font-medium">
                #{Math.floor(1000000 + Math.random() * 9000000)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div> */}

          <div className="border-b border-gray-300 my-2"></div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-gray-600">Service:</p>
              <p className="font-medium">Masterpiece Tattoo</p>
            </div>
            <div className="border-b border-gray-300 my-2"></div>

            <div className="flex justify-between">
              <p className="text-gray-600">MVA:</p>
              <p className="font-medium">0 kr</p>
            </div>
            <div className="border-b border-gray-300 my-2"></div>

            <div className="flex justify-between">
              <p className="text-gray-600">Transaction fee:</p>
              <p className="font-medium">0%</p>
            </div>
            <div className="border-b border-gray-300 my-2"></div>

            <div className="flex justify-between">
              <p className="text-gray-600">Payment method:</p>
              <p className="font-medium">Visa •••• 2345</p>
            </div>
            <div className="border-b border-gray-300 my-2"></div>

            <div className="flex justify-between">
              <p className="text-gray-600">Service charge:</p>
              <p className="font-medium">{paymentData?.amount || "1 000 kr"}</p>
            </div>
            <div className="border-b border-gray-300 my-2"></div>

            <div className="flex justify-between">
              <p className="text-gray-600 font-bold">Total paid:</p>
              <p className="font-bold">{paymentData?.amount || "1 000 kr"}</p>
            </div>
            <div className="border-b border-gray-300 my-2"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6">
          <button
            onClick={onClose}
            className="w-full bg-primary text-white hover:bg-primary/90 py-3 rounded-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const PaymentCard = ({ data, pov }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // console.log(data, "payment11");
  // console.log(pov, "pov11");

  const handleOpenModal = () => {
    if (data.paymentData?.isPaid) {
      // If payment is already received, open receipt modal
      setIsReceiptModalOpen(true);
    } else {
      // Otherwise open payment confirm modal
      setIsConfirmModalOpen(true);
    }
  };

  const handleCloseConfirmpaymentModal = () => {
    setIsConfirmModalOpen(false);
  };

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
  };

  return (
    <>
      <div
        className={`rounded-3xl bg-primary shadow-gray-300 shadow-md overflow-hidden p-2 w-64 ${
          data.sender === "user" ? "rounded-r-md" : "rounded-l-md"
        }`}
      >
        <div
          className={`bg-white rounded-2xl px-4 py-2 mb-2 text-center ${
            data.sender === "user" ? "rounded-tr-md" : "rounded-tl-md"
          }`}
        >
          <h2
            className={`text-lg font-extrabold tracking-wide ${
              data.paymentData?.isPaid ? "text-green-700" : "text-red-700"
            }`}
          >
            {data.paymentData?.isPaid ? "Payment Received" : "Payment Due"}
          </h2>
          <p className="text-3xl font-medium text-gray-800">
            {data.paymentData?.amount}
          </p>
        </div>
        <div className="bg-secondary rounded-2xl px-4 py-1">
          {pov === "provider" && !data.paymentData?.isPaid ? (
            <button
              // onClick={handleOpenModal}
              className="text-white cursor-pointer text-md w-full text-center"
            >
              Payment pending . . .
            </button>
          ) : pov === "buyer" && !data.paymentData?.isPaid ? (
            <button
              onClick={handleOpenModal}
              className="text-white cursor-pointer text-md w-full text-center"
            >
              Pay Now
            </button>
          ) : (
            <button
              onClick={handleOpenModal}
              className="text-white cursor-pointer text-md w-full text-center"
            >
              View Receipt
            </button>
          )}
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmpaymentModal}
        paymentData={data.paymentData}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={handleCloseReceiptModal}
        paymentData={data.paymentData}
      />
    </>
  );
};

// Credit Card component for the swiper
const CreditCard = ({ item, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`${
        isSelected ? "border-primary bg-[#F2E2D4]" : "border-gray-200"
      } p-3 rounded-xl w-full hover:shadow-md transition-all duration-300 cursor-pointer h-full border transform ${
        isSelected ? "scale-100" : "scale-95 opacity-80"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="h-5">
          {item.type === "Visa" ? (
            <span className="font-bold text-blue-600 text-lg tracking-tight">
              VISA
            </span>
          ) : (
            <span className="font-bold text-red-600/90 text-sm tracking-tight">
              MASTERCARD
            </span>
          )}
        </div>
        <div className="w-6 h-6">
          <CreditCardIcon
            className={`w-full h-full ${!isSelected ? "opacity-50" : ""}`}
          />
        </div>
      </div>
      <p
        className={`text-sm ${
          isSelected ? "text-gray-600" : "text-gray-400"
        } font-medium`}
      >
        {item.name}
      </p>
      <p
        className={`text-sm ${
          isSelected ? "text-gray-700" : "text-gray-400"
        } font-mono mt-1`}
      >
        {item.number}
      </p>
      <div className="flex justify-between items-center mt-2">
        <p
          className={`text-xs ${
            isSelected ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Expires {item.expires}
        </p>
        {isSelected ? (
          <CheckCircle2 size={18} className="text-primary" />
        ) : (
          <CircleDot size={18} className="text-gray-300" />
        )}
      </div>
    </div>
  );
};

// Credit Card Swiper Component
const CreditCardSwiper = () => {
  const [cards, setCards] = useState([
    {
      id: 1,
      type: "Visa",
      name: "Default Card",
      number: "•••• •••• •••• 2345",
      expires: "12/25",
      isDefault: true,
    },
    {
      id: 2,
      type: "Visa",
      name: "Secondary Card",
      number: "•••• •••• •••• 2385",
      expires: "08/24",
      isDefault: false,
    },
    {
      id: 3,
      type: "Mastercard",
      name: "Business Card",
      number: "•••• •••• •••• 4532",
      expires: "03/26",
      isDefault: false,
    },
  ]);

  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const handleCardSelect = (cardId) => {
    const index = cards.findIndex((card) => card.id === cardId);
    if (index !== -1) {
      setActiveCardIndex(index);
    }
  };

  return (
    <div className="w-full max-w-[220px] mx-auto">
      <Swiper
        effect={"cards"}
        grabCursor={true}
        modules={[EffectCards, Pagination]}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        cardsEffect={{
          slideShadows: true,
          rotate: false,
          perSlideRotate: 0,
          perSlideOffset: 8,
        }}
        onSlideChange={(swiper) => setActiveCardIndex(swiper.activeIndex)}
        className="h-[140px]"
      >
        {cards.map((card, index) => (
          <SwiperSlide key={card.id} className="rounded-xl overflow-hidden">
            <CreditCard
              item={card}
              isSelected={index === activeCardIndex}
              onSelect={handleCardSelect}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export const PaymentConfirmModal = ({ isOpen, onClose, paymentData }) => {
  const [showPaymentFailed, setShowPaymentFailed] = useState(false);

  const handlePayment = () => {
    // Simulate payment failure
    setShowPaymentFailed(true);
  };

  const handleRetry = () => {
    setShowPaymentFailed(false);
    // Logic to retry payment
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* Close button (X) */}
        <div className="flex justify-end p-3">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Header */}
        <div className="px-6 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Confirm Payment
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 space-y-4">
          <div className="space-y-2">
            <div className="border-b border-gray-300 my-2"></div>
            <div className="flex justify-between">
              <p className="text-gray-600">MVA:</p>
              <p className="font-medium">0 kr</p>
            </div>
            <div className="border-b border-gray-300 my-2"></div>
            <div className="flex justify-between">
              <p className="text-gray-600">Transaction fee:</p>
              <p className="font-medium">0%</p>
            </div>
            <div className="border-b border-gray-300 my-2"></div>
            <div className="flex justify-between">
              <p className="text-gray-600">Service charge:</p>
              <p className="font-medium">{paymentData?.amount || "1 000 kr"}</p>
            </div>
            <div className="border-b border-gray-300 my-2"></div>
            <div className="flex justify-between">
              <p className="text-gray-600 font-bold">What you pay:</p>
              <p className="font-bold">{paymentData?.amount || "1 000 kr"}</p>
            </div>
            <div className="border-b border-gray-300 my-2"></div>
          </div>

          {/* Voucher section */}
          <div className="pt-2">
            <p className="text-primary underline mb-3 font-medium cursor-pointer">
              Voucher?
            </p>

            {/* Card selection */}
            <div className="flex flex-col space-y-4">
              {/* Card Slider */}
              <CreditCardSwiper />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6">
          <button
            onClick={handlePayment}
            className="w-full bg-primary text-white hover:bg-primary/90 py-3 rounded-full"
          >
            Confirm and Pay
          </button>
        </div>
      </div>

      {/* Payment Failed Modal */}
      <PaymentFailedModal
        isOpen={showPaymentFailed}
        onClose={() => setShowPaymentFailed(false)}
        onRetry={handleRetry}
      />
    </div>
  );
};

export const BookingAcceptedCard = ({ data, onViewOrder }) => {
  console.log(data, "booking dataaaaaaaaaaa");
  return (
    <div
      dir={`${data.sender === "user" ? "rtl" : "ltr"}`}
      className={`relative rounded-3xl overflow-hidden shadow-gray-300 shadow-md ${
        data.sender === "user"
          ? "bg-[#F2E2D4] rounded-l-full"
          : "bg-[#FBF2EC] rounded-r-full"
      } `}
    >
      <div className="flex gap-4 justify-between px-3 py-1 items-center">
        <div dir="ltr" className="max-w-70">
          <h2 className="text-secondary text-md md:text-md">
            Your booking has been accepted <br /> and is due in{" "}
            <span className="font-bold">
              {data.bookingData.daysRemaining} days.
            </span>
            <button
              onClick={onViewOrder}
              className="text-primary underline cursor-pointer hover:text-secondary focus:outline-none"
            >
              View order
            </button>
          </h2>
        </div>

        <div className="relative">
          <div className="w-16 h-16 p-1 rounded-full  circle-progress">
            <div className="flex w-full h-full bg-white rounded-full items-center justify-center p-1">
              <div className="text-center">
                <div className="text-secondary text-xl font-bold">
                  {data.bookingData.daysRemaining}
                </div>
                <div className="text-md text-secondary ">Days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReviewModal = ({
  isOpen,
  onClose,
  orderData,
  initialRating,
  setIsReviewed,
}) => {
  const [showThankYou, setShowThankYou] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const { mutate: updateReview } = useUpdateReview(orderData?.reviewId);
  const { mutate: updateMessage } = useUpdateMessage(orderData?.messageId);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      review: "",
      images: [],
    },
  });

  const { uploadFiles, uploading, error } = useImageUploader();
  const images = watch("images");

  useEffect(() => {
    if (initialRating) setValue("rating", initialRating);
  }, [initialRating, setValue]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setValue("images", files);
    setPreviewImages(
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }))
    );
  };

  const handleRemoveImage = (idx) => {
    const newPreview = previewImages.filter((_, i) => i !== idx);
    setPreviewImages(newPreview);
    setValue(
      "images",
      newPreview.map((img) => img.file)
    );
  };

  useEffect(() => {
    if (!isOpen) setPreviewImages([]);
  }, [isOpen]);

  const onSubmit = async (data) => {
    let imageUrls = [];
    if (previewImages.length > 0) {
      const filesToUpload = previewImages.map((img) => img.file);
      const uploadResult = await uploadFiles(filesToUpload);
      if (uploadResult && uploadResult[0]?.success) {
        imageUrls = uploadResult[0].urls;
      }
    }
    const body = { review: data.review, images: imageUrls };
    updateReview(body, {
      onSuccess: () => {
        // toast.success("Review updated successfully");
        const data = { isReviewed: true };
        updateMessage(data);
        setIsReviewed(true);
        setShowThankYou(true);
        setTimeout(() => {
          setShowThankYou(false);
          onClose();
          reset();
        }, 2000);
      },
      onError: () => {
        toast.error("Something went wrong, try again later");
      },
    });
  };

  if (!isOpen) return null;
  if (showThankYou) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30">
        <div className="bg-white rounded-3xl w-full max-w-md p-8 text-center shadow-lg">
          <div className="text-5xl mb-4">⭐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            You left a review!
          </h2>
          <p className="text-gray-600">Thank you for your feedback</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header with Close Button */}
          <div className="pt-5 px-6 relative flex items-center justify-between">
            <h2 className="text-xl font-bold text-center text-gray-800 w-full">
              Leave a Review
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Review Form */}
          <div className="px-6 py-4 space-y-5">
            {/* Last Order Info */}
            <div>
              <p className="text-sm text-gray-700 mb-1">
                Last Order{" "}
                {/* <span className="text-gray-500">
                  #{orderData?.orderNumber || "28894"}
                </span> */}
              </p>
              <div className="flex items-center p-2 bg-gray-50 rounded-xl">
                <div className="relative w-10 h-10 border text-gray-400 rounded-md mr-3">
                  <Image
                    src={orderData.image}
                    alt={orderData?.project}
                    fill
                    className="rounded-md"
                    // width={10}
                    // height={10}
                  />
                </div>
                <div>
                  <p className="text-[#8A3A73] font-medium text-sm">
                    {orderData?.project || "last Order"}
                  </p>
                </div>
                <div className="ml-auto">
                  <p className="text-gray-800 font-medium">
                    {orderData?.amount} kr
                  </p>
                </div>
              </div>
            </div>

            {/* Review Text Area */}
            <div>
              <p className="text-sm text-gray-700 mb-1">Review</p>
              <textarea
                placeholder="Type here"
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8A3A73] focus:border-[#8A3A73] bg-gray-50 text-sm"
                rows="3"
                {...register("review", { required: true })}
              ></textarea>
            </div>

            {/* Images */}
            <div>
              <p className="text-sm text-gray-700 mb-1">Images</p>
              <div className="relative mt-1 border border-gray-200 rounded-xl p-3 flex items-center bg-gray-50">
                <svg
                  className="text-gray-400"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 10H6M12 4V16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="ml-2 text-gray-500 text-sm">Attachments</span>
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  multiple
                  {...register("images")}
                  onChange={handleImageChange}
                />
                {previewImages.length > 0 && (
                  <span className="ml-auto flex items-center justify-center w-5 h-5 bg-green-600 text-white text-xs rounded-full">
                    {previewImages.length}
                  </span>
                )}
              </div>
              {previewImages.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {previewImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16">
                      <img
                        src={img.url}
                        alt={`preview-${idx}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 text-gray-600 hover:text-red-600"
                        title="Remove"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {uploading && (
                <div className="text-xs text-blue-600 mt-1">Uploading...</div>
              )}
              {error && (
                <div className="text-xs text-red-600 mt-1">{error}</div>
              )}
            </div>

            {/* Rating */}
            <div>
              <p className="text-sm text-gray-700 mb-1">Rating</p>
              <div className="flex justify-between items-center mt-1 bg-gray-50 p-3 rounded-xl">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="cursor-pointer mr-1"
                      onClick={() => setValue("rating", star)}
                    >
                      <svg
                        width="22"
                        height="22"
                        fill={
                          star <= Math.floor(watch("rating")) ||
                          (star === Math.ceil(watch("rating")) &&
                            watch("rating") % 1 >= 0.5)
                            ? "#FFD700"
                            : "none"
                        }
                        stroke="#FFD700"
                        strokeWidth="1"
                        viewBox="0 0 24 24"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </span>
                  ))}
                </div>
                <div className="text-gray-800 text-sm font-medium">
                  {watch("rating").toFixed(1)}
                  <span className="text-gray-500 text-xs ml-1">Rating</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#8A3A73] hover:bg-[#7A3465] transition-colors text-white py-3 rounded-full font-medium mt-2"
              disabled={uploading || !watch("review")}
            >
              {uploading ? "Uploading..." : "Leave Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const RatingSlider = ({
  data,
  currentUser,
  provider,
  chatOrders,
  msgId,
}) => {
  const [rating, setRating] = useState(data.rating);
  const [submitted, setSubmitted] = useState(data.rating ? true : false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [locked, setLocked] = useState(data.rating ? true : false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReviewed, setIsReviewed] = useState(data?.isReviewed);
  const sliderRef = useRef(null);
  const sliderTrackRef = useRef(null);
  const isDragging = useRef(false);
  const service = chatOrders[chatOrders.length - 1]?.service || null;

  // console.log(chatOrders[chatOrders.length-1]?.service?._id,"chatOrders11")
  // console.log(data.id, "msgidddddd")

  console.log(data, "data123123");

  const { mutate: createReview, isLoading } = useCreateReview();

  const { mutate: updateMessage } = useUpdateMessage(data.id);

  // Handle slider interaction
  const handleSliderInteraction = (clientX) => {
    if (!sliderTrackRef.current || locked) return;

    const rect = sliderTrackRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = position / rect.width;
    const newRating = Math.min(5, Math.max(0, percentage * 5));

    setRating(newRating);
    if (newRating > 0) {
      setSubmitted(true);
    }
  };

  // Mouse events
  const handleMouseDown = (e) => {
    if (locked) return;
    isDragging.current = true;
    handleSliderInteraction(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current && !locked) {
      handleSliderInteraction(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current && !locked) {
      isDragging.current = false;
      setShowConfirmModal(true);
    }
  };

  // Touch events
  const handleTouchStart = (e) => {
    if (locked) return;
    isDragging.current = true;
    handleSliderInteraction(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (isDragging.current && !locked) {
      handleSliderInteraction(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging.current && !locked) {
      isDragging.current = false;
      setShowConfirmModal(true);
    }
  };

  const handleConfirm = () => {
    const body = {
      buyer: currentUser,
      provider: provider,
      service: service?._id,
      // mission: "67da83b1e38a9f9d03a6ee2a",
      revewType: "buyer-to-provider",
      rating: Number(rating.toFixed(1)),
      // review: "nice",
      // images: [
      //   "https://example.com/image1.jpg",
      //   "https://example.com/image2.jpg",
      // ],
    };
    createReview(body, {
      onSuccess: (res) => {
        console.log(res, "reviewresponse");
        toast.success("rating successfull");

        const data = {
          rating: Number(rating.toFixed(1)),
          reviewId: res?.data?._id,
        };

        updateMessage(data);

        setLocked(true);
      },
      onError: () => {
        toast.success("error");
      },
    });

    setShowConfirmModal(false);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setRating(0);
    setSubmitted(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [locked]);

  // Calculate filled width percentage
  const filledPercentage = (rating / 5) * 100;

  const handleOpenReviewModal = () => {
    setShowReviewModal(true);
  };

  return (
    <>
      <div className="relative w-full max-w-sm bg-[#FBF2EC]  rounded-r-full overflow-hidden text-secondary shadow-gray-300 shadow-md py-2 px-2 flex items-center justify-between">
        <div className="flex-grow px-2">
          {!submitted ? (
            <h2 className=" text-md ">How was your experience?</h2>
          ) : (
            <div>
              <h2 className="text-md">
                Thanks!{" "}
                {!isReviewed && (
                  <span
                    onClick={handleOpenReviewModal}
                    className=" font-bold underline text-primary cursor-pointer hover:text-secondary transition-colors"
                  >
                    Leave a review
                  </span>
                )}
              </h2>
            </div>
          )}

          {/* Slider Track with inset shadow */}
          <div
            ref={sliderTrackRef}
            className="relative h-10 mt-2 bg-[#F2E2D4] rounded-full overflow-hidden cursor-pointer shadow-inner"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              boxShadow: "inset 0 2px 2px rgba(0,0,0,0.5)",
            }}
          >
            {/* Filled background gradient */}
            <div
              className="absolute top-0 left-0 h-full"
              style={{
                boxShadow: "inset 0 2px 2px rgba(0,0,0,0.25)",
                width: `${filledPercentage}%`,
                background: "white",
              }}
            />

            {/* Stars container */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-evenly px-5 z-10">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled =
                  star <= Math.floor(rating) ||
                  (star === Math.ceil(rating) && rating % 1 >= 0.5);
                return (
                  <div key={star} className="relative">
                    {/* star */}
                    <svg
                      width="25"
                      height="25"
                      viewBox="0 0 24 24"
                      fill={isFilled ? "#B3A744" : "none"}
                      stroke="#B3A744"
                      strokeWidth="2"
                      style={{
                        filter: isFilled
                          ? "drop-shadow(0 0.5px 0.5px rgba(0,0,0,0.5))"
                          : "none",
                        transition: "fill 0.2s ease, filter 0.2s ease",
                      }}
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                );
              })}
            </div>

            {/* Slider thumb with enhanced shadow */}
            <div
              ref={sliderRef}
              className="absolute top-0 h-full bg-white rounded-full w-12 z-20"
              style={{
                left: `calc(${filledPercentage}% - ${
                  filledPercentage === 0 ? 0 : 32
                }px)`,
                transition: isDragging.current ? "none" : "left 0.2s ease",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.30), 0 1px 3px rgba(0,0,0,0.25)",
              }}
            />
          </div>
        </div>

        {/* Rating display with enhanced depth */}
        <div
          className="bg-white rounded-full w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center ml-2"
          style={{
            boxShadow: "inset 0 2px 2px rgba(0,0,0,0.25)",
          }}
        >
          <span
            className="text-md md:text-2xl text-gray-600 font-bold mb-1"
            style={{
              textShadow: submitted ? "0 1px 1px rgba(0,0,0,0.05)" : "none",
            }}
          >
            {!submitted ? "-" : rating?.toFixed(1)}
          </span>
          <span className="text-gray-500 text-sm">Rating</span>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        setIsReviewed={setIsReviewed}
        orderData={{
          image: service.images[0],
          project: service.name,
          amount: chatOrders[chatOrders.length - 1]?.amount,
          reviewId: data?.reviewId,
          messageId: data?.id,
        }}
        initialRating={rating}
      />

      {/* Confirm Modal */}
      <RatingConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        rating={rating}
      />
    </>
  );
};

export const RatingConfirmModal = ({ isOpen, onConfirm, onCancel, rating }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-lg text-center">
        <h2 className="text-lg font-bold mb-2 text-gray-800">Confirm Rating</h2>
        <p className="mb-4 text-gray-600">
          Are you sure you want to submit a rating of{" "}
          <span className="font-bold">{rating.toFixed(1)}</span>?
        </p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-full"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-primary text-white py-2 rounded-full"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Payment Failed Modal
export const PaymentFailedModal = ({ isOpen, onClose, onRetry }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-lg">
        {/* Header */}
        <div className="pt-6 px-6 flex flex-col items-center">
          <div className="bg-red-50 rounded-full p-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center mt-4">
            Payment Failed
          </h2>
          <p className="text-gray-600 text-center my-4 text-sm">
            Your payment did not go through, Please try again or use a different
            payment method.
          </p>
        </div>

        {/* Error details */}
        <div className="px-6 py-4">
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full bg-primary text-white py-3 rounded-xl flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PaymentModal = ({
  SetShowPaymentRequest,
  chatOrders = [],
  currentUser,
  setMessages,
  setSidebarLastMessages,
  activeChatId,
  createMessage,
  setIsSent,
  messagesEndRef,
}) => {
  const [amount, setAmount] = useState(1000);
  const [isEditing, setIsEditing] = useState(false);
  const [tempAmount, setTempAmount] = useState("1000");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [comment, setComment] = useState("");

  // Find the selected order from chatOrders
  const selectedOrder = chatOrders.find(
    (order) => order._id === selectedOrderId
  );

  console.log(selectedOrder?._id, "aaaaaaaaaaaarererererere");

  // If an order is selected, use its amount, otherwise default
  useEffect(() => {
    if (selectedOrder) {
      setAmount(selectedOrder.amount || 0);
      setTempAmount((selectedOrder.amount || 0).toString());
    }
  }, [selectedOrderId]);

  // Dummy data fallback for sender
  const dummyData = {
    sender: "Jonathan Vestli",
    orderId: "#184200",
    product: {
      name: "Custom Furniture - Consultation",
      company: "T.R. Carpentry",
      description:
        "Choose from a wide variety of different colours and styles.",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=80&h=60&fit=crop",
      quantity: "200 meters",
    },
    fees: {
      mvaPercentage: 20,
      transactionFeePercentage: 0,
      serviceCharge: 0,
      addOns: 0,
      depositReturn: 0,
    },
  };

  const ServiceInfoCard = ({ data }) => {
    // Destructure service properties with fallback values
    const {
      name = "",
      description = "",
      price = "",
      currency = "kr",
      distance = 0,
      duration = "0 min",
      images = [],
    } = data || {};

    return (
      <CardWrapper item={data}>
        <div className="flex h-26 bg-white rounded-2xl shadow-md">
          {/* Image container */}
          <div className="relative h-26 w-25 flex-shrink-0 rounded-2xl">
            {images[0] && (
              <Image
                src={images[0]}
                alt={name}
                fill
                className="object-cover rounded-2xl"
                sizes="(max-width: 768px) 96px, 176px"
              />
            )}
          </div>
          {/* Content container */}
          <div className="flex h-full p-2 flex-grow ">
            <div className="flex flex-col  justify-between ">
              {/* Service name */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 ">{name}</h3>
                {/* Business name / provider */}
                <p className="text-sm text-gray-600 max-w-50 overflow-hidden text-ellipsis whitespace-nowrap">
                  {description}
                </p>
              </div>
              {/* Distance and duration */}
              <div className="flex items-center text-sm text-gray-700">
                <FaMapMarkerAlt className="mr-1" />
                <span>{distance} meters</span>
              </div>
            </div>
            <div className="flex flex-col justify-between ml-auto items-center">
              {duration && (
                <div>
                  <div className="flex items-center justify-end text-sm text-gray-700">
                    <FaClock className="mr-1 text-xl" />
                    <span>{duration}</span>
                  </div>
                </div>
              )}
              {/* Price display */}
              <div className="flex justify-end">
                <span className="font-semibold text-black">
                  {price} {currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  };

  // Calculate totals
  const mvaAmount = (amount * (dummyData.fees.mvaPercentage || 0)) / 100;
  const total =
    amount +
    (dummyData.fees.serviceCharge || 0) -
    (dummyData.fees.depositReturn || 0) +
    (dummyData.fees.addOns || 0);

  const handleAmountClick = () => {
    setIsEditing(true);
    setTempAmount(amount.toString());
  };

  const handleAmountSubmit = () => {
    const newAmount = parseInt(tempAmount) || 0;
    setAmount(newAmount);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAmountSubmit();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setTempAmount(amount.toString());
    }
  };

  const formatAmount = (num) => {
    return num.toLocaleString("nb-NO");
  };

  const handleSend = () => {
    const senderId = currentUser;
    if (!senderId) {
      console.error("❌ senderId is missing");
      return;
    }

    let newMessage = {
      id: Date.now(),
      sender: "user",
      status: "sent",
      type: "payment",
      paymentData: {
        amount: total,
        method: "",
        isPaid: false,
        // booking:
      },
      isPaid: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setSidebarLastMessages((prev) => ({
      ...prev,
      [activeChatId]: {
        content: "Payment Request",
        createdAt: new Date().toISOString(),
      },
    }));

    //  scrollToEnd
    setTimeout(() => {
      messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    const payload = {
      content: `Payment Request : ${total}`,
      senderProfileId: currentUser,
      buyerProfileId: chatOrders[0].customer,
      sellerProfileId: chatOrders[0].provider,
      type: "payment",
      amount: total,
      payment: {
        amount: total,
        comment: comment,
        booking: selectedOrder._id || null,
        isPaid: false,
      },
    };

    console.log("payload", payload);
    // console.log("🔍 isMission: ", isMission);

    createMessage(payload, {
      onSuccess: (res) => {
        SetShowPaymentRequest(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
          )
        );
        console.log("successss");

        setIsSent(true);
        console.log("🔍 res: ", res.data.roomId);
      },
      onError: (err) => {
        SetShowPaymentRequest(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "failed" } : msg
          )
        );
        console.log("failedd");

        console.error("❌ Failed to send message:", err);
      },
      onSettled: () => {
        setIsSent(false);
      },
    });
  };

  const handleButtonClick = () => {
    if (!showOrderDetails && selectedOrderId) {
      // Show order details
      setShowOrderDetails(true);
    } else if (showOrderDetails) {
      // Request payment
      handleSend();
      SetShowPaymentRequest(false);
    }
  };

  // Determine button text and state
  const getButtonText = () => {
    if (!selectedOrderId) return "Review Request";
    if (!showOrderDetails) return "Review Request";
    return "Request Payment";
  };

  const isButtonDisabled = !selectedOrderId;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Request Payment
            </h2>
            <p className="text-sm text-gray-500">From: {dummyData.sender}</p>
          </div>
          <button
            onClick={() => SetShowPaymentRequest(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Amount - Editable */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            {isEditing ? (
              <div className="relative">
                <input
                  type="text"
                  value={tempAmount}
                  onChange={(e) =>
                    setTempAmount(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  onKeyDown={handleKeyPress}
                  onBlur={handleAmountSubmit}
                  className="text-3xl font-bold text-gray-900 bg-transparent text-center w-full outline-none border-b-2 border-purple-500"
                  autoFocus
                />
                <span className="text-3xl font-bold text-gray-900 ml-2">
                  kr
                </span>
              </div>
            ) : (
              <div
                onClick={handleAmountClick}
                className="cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {formatAmount(amount)} kr
                </div>
              </div>
            )}
            <div className="text-sm text-gray-500">
              Including {dummyData.fees.mvaPercentage}% MVA
            </div>
          </div>
        </div>

        {/* Dropdown for orders (shows when no order selected or details not shown) */}
        {!showOrderDetails && (
          <div className="px-6 pb-6 flex flex-col gap-2">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Select Order
              </label>
              <select
                className="w-full border border-gray-600 rounded-lg p-2 text-gray-700"
                value={selectedOrderId || ""}
                onChange={(e) => setSelectedOrderId(e.target.value)}
              >
                <option value="" disabled>
                  Select an order
                </option>
                {chatOrders.map((order) => (
                  <option key={order._id} value={order._id}>
                    {order.service?.name || "No Name"}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full border rounded-lg p-2 border-gray-600">
              <input
                type="text"
                placeholder="comment"
                className="w-full border-none outline-none text-gray-700"
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Show card/details only if order is selected AND showOrderDetails is true */}
        {selectedOrderId && showOrderDetails && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Order</h3>
              <span className="text-sm text-gray-500">
                {selectedOrder?._id}
              </span>
            </div>

            {/* Product */}
            <div className="flex items-start gap-3 mb-6">
              <div className="flex-1">
                <ServiceInfoCard data={selectedOrder?.service} />
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 mb-6 px-2 max-h-[150px] custom-scrollbar overflow-y-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">MVA:</span>
                <span className="text-gray-900">
                  {formatAmount(Math.round(mvaAmount))} kr
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction fee:</span>
                <span className="text-gray-900">
                  {dummyData.fees.transactionFeePercentage}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service charge:</span>
                <span className="text-gray-900">
                  {formatAmount(dummyData.fees.serviceCharge)} kr
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Add-ons:</span>
                <span className="text-gray-900">
                  {formatAmount(dummyData.fees.addOns)} kr
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Deposit return:</span>
                <span className="text-gray-900">
                  {formatAmount(dummyData.fees.depositReturn)} kr
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatAmount(Math.round(total))} kr
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="px-6 pb-4">
          <button
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
            className={`w-full font-medium py-4 px-6 rounded-2xl transition-colors ${
              isButtonDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary hover:bg-secondary text-white"
            }`}
          >
            {getButtonText()}
          </button>

          {/* Bottom indicator */}
          <div className="flex justify-center mt-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ImageMessageModal = ({ isOpen, onClose, onSend, uploading }) => {
  const [previewImages, setPreviewImages] = useState([]);
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: { text: "", images: [] },
  });

  // Handle file input
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setValue("images", files);
    setPreviewImages(
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }))
    );
  };

  // Remove image
  const handleRemoveImage = (idx) => {
    const newPreview = previewImages.filter((_, i) => i !== idx);
    setPreviewImages(newPreview);
    setValue(
      "images",
      newPreview.map((img) => img.file)
    );
  };

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPreviewImages([]);
      reset();
    }
  }, [isOpen, reset]);

  // Submit handler
  const onSubmit = (data) => {
    onSend({
      text: data.text,
      images: previewImages.map((img) => img.file),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">Send Images</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 mb-2">Images</label>
              <div className="relative border border-gray-300 rounded-xl p-3 bg-gray-50 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  {...register("images")}
                  onChange={handleImageChange}
                />
                <span className="text-gray-500">Click to select images</span>
                {previewImages.length > 0 && (
                  <span className="ml-auto flex items-center justify-center w-5 h-5 bg-green-600 text-white text-xs rounded-full">
                    {previewImages.length}
                  </span>
                )}
              </div>
              {/* Preview */}
              {previewImages.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {previewImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16">
                      <img
                        src={img.url}
                        alt={`preview-${idx}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 text-gray-600 hover:text-red-600"
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Text */}
            <div>
              <label className="block text-gray-700 mb-2">
                Message (optional)
              </label>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm"
                rows="2"
                placeholder="Type a message..."
                {...register("text")}
              />
            </div>
          </div>
          {/* Footer */}
          <div className="flex gap-2 p-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-full"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2 rounded-full"
              disabled={uploading || previewImages.length === 0}
            >
              {uploading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ImageMessageCollage = ({ images = [], text = "", data }) => {
  const displayImages = images.slice(0, 4);
  const extraCount = images.length - 4;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIdx, setModalIdx] = useState(0);

  // Helper to get url from object or string
  const getUrl = (img) => (typeof img === "string" ? img : img.url);

  // All images for modal (not just first 4)
  const allImages = images.map(getUrl);

  return (
    <>
      <div
        className={`flex flex-col items-start p-2 rounded-3xl overflow-hidden text-secondary shadow-gray-300 shadow-md
          ${
            data.sender === "user"
              ? "bg-[#F2E2D4] rounded-br-none"
              : "bg-[#FBF2EC] rounded-bl-none"
          }
      `}
      >
        <div
          className={`grid gap-1 ${
            images.length === 1 ? "" : "grid-cols-2"
          } max-w-xs`}
        >
          {displayImages.map((img, idx) => {
            const url = getUrl(img);
            return (
              <div
                key={idx}
                className="relative w-28 h-28 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => {
                  setModalIdx(idx);
                  setModalOpen(true);
                }}
              >
                <img
                  src={url}
                  alt={`img-${idx}`}
                  className="object-cover w-full h-full"
                />
                {extraCount > 0 && idx === 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-bold">
                    +{extraCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {text && (
          <div className="mt-2 px-2 py-1 rounded-lg text-gray-800 text-sm w-full">
            {text}
          </div>
        )}
      </div>

      {/* Modal for image viewing */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative">
            <img
              src={allImages[modalIdx]}
              alt={`modal-img-${modalIdx}`}
              className="max-h-[80vh] max-w-[90vw] rounded-xl shadow-lg"
            />
            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 bg-white/80 rounded-full p-1"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {/* Prev/Next navigation */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setModalIdx(
                      (modalIdx - 1 + allImages.length) % allImages.length
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1"
                  disabled={allImages.length <= 1}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={() => setModalIdx((modalIdx + 1) % allImages.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1"
                  disabled={allImages.length <= 1}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
