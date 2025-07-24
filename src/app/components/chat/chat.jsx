"use client";
import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { Send, Search, Plus, Check, CheckCheck, Clock } from "lucide-react";
import {
  OrderCard,
  PaymentCard,
  BookingAcceptedCard,
  RatingSlider,
  PaymentModal,
} from "./specialMessages";
import ActivityCard from "../Activity/ActivityCard"; // Import ActivityCard instead
import Image from "next/image";
import useAuthStore from "@/app/store/useAuthStore";
import VoucherSystem from "./VoucherModel";
import {
  useGetRecentConversation,
  useGetMessageHistoryById,
  useCreateMessage,
} from "@/app/hooks/useChat";
import { io } from "socket.io-client";
import { VoucherCard } from "../Reusable/Card";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useImageUploader from "../../utils/imgUpload"; // already imported in specialMessages.jsx
import { ImageMessageModal, ImageMessageCollage } from "./specialMessages";

function formatBackendMessage(msg, currentProfileId, setChatOrders) {
  // ORDER
  if (msg.type === "order" && msg.booking) {
    // console.log(msg, "msggggg");
    setChatOrders((prev) => [...prev, msg.booking]);
    // console.log("chatOrders", chatOrders);

    return {
      id: msg._id,
      type: "order",
      sender: msg.sender === currentProfileId ? "user" : "bot",
      orderData: {
        _id: msg.booking._id,
        customer: msg.booking.customer,
        project: msg.booking.service?.name,
        sessionDate: msg.booking.slot?.date,
        sessionTime: msg.booking.slot
          ? `${msg.booking.slot.startTime} - ${msg.booking.slot.endTime}`
          : "",
        // requestTime: new Date(msg.createdAt).toLocaleString(),
        totalPrice: msg.booking.amount ? `${msg.booking.amount}` : "",
        // requestPrice: msg.booking.amount ? `${msg.booking.amount} kr` : "",
        comment: msg.content,
        addons: msg.booking.addons || [],
        images: msg.booking.service?.images || [],
        status: msg.booking.status,
        paymentStatus: msg.booking.paymentStatus,
        isAccepted: msg.booking.isAccepted,
      },
      createdAt: msg.createdAt,
    };
  }

  // MISSION
  if (msg.type === "mission") {
    console.log("msg.mission", msg.mission);
    return {
      id: msg._id,
      type: "mission",
      sender: msg.sender === currentProfileId ? "user" : "bot",
      text: msg.content,
      missionData: {
        id: msg.mission._id,
        title: msg.mission.title,
        description: msg.mission.about,
        image: msg.mission.images[0] || "/images/default-image.png",
        business: msg.mission.category?.name,
        days: msg.mission.remainingDays,
        status: msg.mission.status,
        location: msg.mission.location,
        deadline: new Date(msg.mission.deadline).toLocaleDateString(),
      },
    };
  }

  // PAYMENT
  if (msg.type === "payment") {
    // console.log(msg, "pay11");

    return {
      id: msg._id,
      type: "payment",
      sender: msg.sender === currentProfileId ? "user" : "bot",
      paymentData: {
        amount: msg.payment?.amount ? `${msg.payment?.amount} kr` : "0",
        // method: msg?.paymentMethod || "Visa •••• 2345", // fallback
        isPaid: msg.payment?.isPaid,
      },
      isPaid: msg.payment?.paymentStatus,
      createdAt: msg.createdAt,
    };
  }

  // VOUCHER
  if (msg.type === "voucher") {
    // console.log(msg, "pay11");

    return {
      id: msg._id,
      type: "voucher",
      sender: "system",
      voucherData: {
        name: msg?.voucher?.title,
        image: msg?.voucher?.images[0], // Placeholder image URL
        price: msg?.voucher?.voucherValue,
        rating: 4.5,
        description: msg?.voucher?.about,
        distance: 0, // in meters
        expiryDate: msg?.voucher?.validity,
      },
      createdAt: msg.createdAt,
    };
  }

  // BOOKING ACCEPTED
  if (msg.type === "dueCard" && msg.booking) {
    // You can customize daysRemaining logic as needed
    return {
      id: msg._id,
      type: "dueCard",
      sender: msg.sender === currentProfileId ? "user" : "bot",
      bookingData: {
        daysRemaining: msg.booking.daysRemaining || 0,
        ...msg.booking,
      },
      createdAt: msg.createdAt,
    };
  }

  // RATING REQUEST
  if (msg.type === "rating") {
    // console.log(msg, "msssssss")
    return {
      id: msg._id,
      type: "rating",
      sender: msg.sender === currentProfileId ? "user" : "bot",
      rating: msg.rating,
      reviewId: msg.reviewId,
      isReviewed: msg.isReviewed,
      createdAt: msg.createdAt,
    };
  }

  // IMAGES
  if (msg.type === "images") {

    console.log(msg, "qweqweqw")
    console.log(currentProfileId, "qweqweqw")
    return {
      id: msg._id,
      type: "images",
      sender: msg.sender === currentProfileId ? "user" : "bot",
      text: msg.content,
      images: msg.media,
      createdAt: msg.createdAt,
    };
  }

  // NORMAL MESSAGE
  if (msg.type === "message") {
    return {
      id: msg._id,
      type: "message",
      sender: msg.sender === currentProfileId ? "user" : "bot",
      text: msg.content,
      createdAt: msg.createdAt,
    };
  }

  // FALLBACK
  return {
    id: msg._id,
    type: msg.type,
    sender: msg.sender === currentProfileId ? "user" : "bot",
    text: msg.content,
    createdAt: msg.createdAt,
  };
}

const Chat = ({ currentUser, profileId }) => {
  const { currentProfile } = useAuthStore();
  const messagesEndRef = useRef(null);
  const [showVoucher, setShowVoucher] = useState(false);
  const [showPaymentRequest, SetShowPaymentRequest] = useState(false);
  const router = useRouter();

  const pov = currentProfile?.profileType;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChats, setActiveChats] = useState([]);
  const activeChatId = activeChats.find((chat) => chat.active === true)?.id;
  const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_CHAT_SERVER_URL;
  const ROOM_ID = activeChatId;
  const [isSent, setIsSent] = useState(false);
  const [sidebarLastMessages, setSidebarLastMessages] = useState({});
  const [chatOrders, setChatOrders] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const { data: recentConversation, isLoading: isRecentConversationLoading } =
    useGetRecentConversation(currentUser);

  // console.log("recentConversation", recentConversation);

  const chats = useMemo(() => {
    const compiledChats =
      recentConversation?.data?.rooms.map((room) => {
        const sidebarMsg = sidebarLastMessages[room._id];
        const lastMessageContent =
          sidebarMsg?.content ?? room?.lastMessage?.content ?? "";
        const lastMessageTime =
          sidebarMsg?.createdAt ?? room?.lastMessage?.createdAt ?? null;

        let time = "";
        if (lastMessageTime) {
          const createdAtDate = new Date(lastMessageTime);
          const nowDate = new Date();

          const isSameDay = (d1, d2) =>
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();

          const isToday = isSameDay(createdAtDate, nowDate);

          const yesterdayDate = new Date(nowDate);
          yesterdayDate.setDate(nowDate.getDate() - 1);
          const isYesterday = isSameDay(createdAtDate, yesterdayDate);

          if (isToday) time = "Today";
          else if (isYesterday) time = "Yesterday";
          else {
            const diffTime = nowDate - createdAtDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            time = isNaN(diffDays) ? "" : `${diffDays}d`;
          }
        } else {
          time = "";
        }

        return {
          id: room._id,
          name: room.participants.find(
            (participant) => participant._id !== currentUser
          )?.name,
          avatar:
            room.participants.find(
              (participant) => participant._id !== currentUser
            )?.avatar ||
            "https://images.pexels.com/photos/977796/pexels-photo-977796.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
          lastMessage: lastMessageContent,
          time,
          unread: room.unread || false,
          active: false,
        };
      }) || [];

    console.log("compiledChats", compiledChats);

    setActiveChats((prevActiveChats) => {
      // Find the currently active chat id
      const activeId = prevActiveChats.find((c) => c.active)?.id;
      // Map new chats, preserving the active property
      return compiledChats.map((chat) => ({
        ...chat,
        active: chat.id === activeId,
      }));
    });

    return compiledChats;
  }, [recentConversation, currentUser, sidebarLastMessages]);

  // console.log("chatschatschats", chats);

  const {
    data: messageHistory,
    isLoading: messagesLoading,
    refetch: refetchMessageHistory,
  } = useGetMessageHistoryById(activeChatId);

  useEffect(() => {
    if (activeChatId) {
      refetchMessageHistory();
    }
  }, [activeChatId, refetchMessageHistory]);

  const { mutate: createMessage, isLoading: isCreateMessageLoading } =
    useCreateMessage();

  const activeChatMessages = useMemo(() => {
    return messageHistory?.data?.messages || [];
  }, [messageHistory]);

  // console.log("activeChatMessages", activeChatMessages);

  // Effect for auto-scrolling
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect for window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSend = () => {
    if (input.trim() === "") return;

    const senderId = currentUser;
    if (!senderId) {
      console.error("❌ senderId is missing");
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "message",
      status: "sending",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setSidebarLastMessages((prev) => ({
      ...prev,
      [activeChatId]: {
        content: input,
        createdAt: new Date().toISOString(),
      },
    }));

    // React Web equivalent of scrollToEnd
    setTimeout(() => {
      messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    const payload = {
      content: input,
      senderProfileId: currentUser,
      buyerProfileId: recentConversation?.data?.rooms.find(
        (room) => room._id === activeChatId
      )?.buyerProfile?._id,
      sellerProfileId: recentConversation?.data?.rooms.find(
        (room) => room._id === activeChatId
      )?.sellerProfile?._id,
    };

    console.log("payload", payload);
    // console.log("🔍 isMission: ", isMission);

    createMessage(payload, {
      onSuccess: (res) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
          )
        );

        setIsSent(true);
        console.log("🔍 res: ", res.data.roomId);
      },
      onError: (err) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "failed" } : msg
          )
        );

        console.error("❌ Failed to send message:", err);
      },
      onSettled: () => {
        setIsSent(false);
      },
    });
  };

  const handleSendRating = () => {
    const payload = {
      content: "rating request",
      senderProfileId: currentUser,
      buyerProfileId: recentConversation?.data?.rooms.find(
        (room) => room._id === activeChatId
      )?.buyerProfile?._id,
      sellerProfileId: recentConversation?.data?.rooms.find(
        (room) => room._id === activeChatId
      )?.sellerProfile?._id,
      type: "rating",
    };

    createMessage(payload, {
      onSuccess: (res) => {
        toast.success("Rating Request Send");

        setIsSent(true);
        console.log("🔍 res: ", res.data.roomId);
      },
      onError: (err) => {
        toast.error("Something went wrong, Try again later");

        console.error("❌ Failed to send message:", err);
      },
    });
  };

  useEffect(() => {
    if (!SOCKET_SERVER_URL || !ROOM_ID) return; // Don't connect if missing

    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    newSocket.emit("joinRoom", ROOM_ID, (response) => {
      console.log("Successfully joined room:", ROOM_ID, response);
    });

    newSocket.on("newMessage", (msg) => {
      console.log("Received newMessage from socket:", msg);
      if (msg.sender !== currentUser) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: msg._id,
            text: msg.content,
            sender: "bot",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: msg.type || "message",
            status: "sent",
          },
        ]);
        setSidebarLastMessages((prev) => ({
          ...prev,
          [ROOM_ID]: {
            content: msg.content,
            createdAt: msg.createdAt,
          },
        }));
      }
    });

    return () => {
      newSocket.disconnect();
      console.log("Socket disconnected");
    };
  }, [SOCKET_SERVER_URL, ROOM_ID, currentUser]);

  useEffect(() => {
    if (messageHistory?.data?.messages && !isSent) {
      // console.log("currentUserProfile?._id", currentUserProfile?._id)

      const MapNewMessages = messageHistory?.data?.messages.map((msg) => ({
        ...msg,
        id: msg._id,
        message: msg.content,
        sender: msg.sender === currentUser ? "user" : "bot",
        time: msg.createdAt,
        type: msg.type || "message",
        status: "sent",
      }));

      // console.log("MapNewMessages", MapNewMessages)

      // console.log('🔍 HistoryMessages: ', HistoryMessages?.data?.messages)

      setMessages((prevMessages) => [...prevMessages, ...MapNewMessages]);
    }
  }, [messageHistory]);

  // Change active chat
  const changeActiveChat = (chatId) => {
    setActiveChats((prevChats) =>
      prevChats.map((chat) => ({
        ...chat,
        active: chat.id === chatId,
        unread: chat.id === chatId ? false : chat.unread,
      }))
    );

    // Reset mission data when changing chats
    setActiveMission(null);
    setActiveBidder(null);
    sessionStorage.removeItem("activeMission");
    sessionStorage.removeItem("activeBidder");

    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // // Filter chats based on search term
  const filteredChats = activeChats.filter((chat) =>
    chat?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get active chat details
  const activeChat =
    activeChats.find((chat) => chat.active) || activeChats[0] || {};

  // Create a dummy renderBidsList function since original component needs it
  const renderBidsList = () => null;

  const handleSendSpecialMessage = (type, data) => {
    let newMessage = {
      id: Date.now(),
      sender: "user",
      status: "sent",
    };

    if (type === "order") {
      newMessage = {
        ...newMessage,
        type: "order",
        orderData: {
          customer: "John Doe",
          project: "Tattoo Design",
          sessionTime: "2:00 PM - 3:00 PM",
          requestTime: "Today, 1:45 PM",
          totalPrice: "1200 kr",
          requestPrice: "1000 kr",
          comment: "Please make it bold.",
          addons: [{ name: "Extra Color", quantity: 1, price: "200 kr" }],
          images: [
            "https://images.pexels.com/photos/977796/pexels-photo-977796.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
          ],
        },
      };
    } else if (type === "payment") {
      newMessage = {
        ...newMessage,
        type: "payment",
        paymentData: {
          amount: data,
          method: "Visa •••• 2345",
          isPaid: false,
        },
        isPaid: false,
      };
    } else if (type === "booking-accepted") {
      newMessage = {
        ...newMessage,
        type: "booking-accepted",
        bookingData: { daysRemaining: 3 },
      };
    } else if (type === "rating-request") {
      newMessage = {
        ...newMessage,
        type: "rating-request",
      };
    } else if (type === "voucher") {
      newMessage = {
        ...newMessage,
        type: "voucher",
        sender: "user",
        voucherData: {
          name: "Delicious Pizza Deal",
          image: "https://via.placeholder.com/300x200", // Placeholder image URL
          price: "$12 Off",
          rating: 4.5,
          description:
            "Get a delicious large pizza with extra cheese and toppings. Limited time offer!",
          distance: 500, // in meters
          expiryDate: "Expires on 31st July, 2025",
        },
      };
    }

    setMessages([...messages, newMessage]);
  };

  // MAP MESSAGES TO THE CHAT
  useEffect(() => {
    if (activeChatMessages && activeChatMessages.length > 0) {
      setChatOrders([]);
      const formatted = activeChatMessages.map((msg) =>
        formatBackendMessage(msg, currentUser, setChatOrders, chatOrders)
      );
      console.log("chatOrders", chatOrders);
      console.log(formatted, "formatted");
      setMessages(formatted);
    } else {
      setMessages([]);
    }
  }, [activeChatMessages, currentUser]);

  // Add this effect to handle profileId parameter and activate the correct chat
  useEffect(() => {
    if (profileId && chats.length > 0 && recentConversation?.data?.rooms) {
      // Find the room that contains the specified profileId
      const targetRoom = recentConversation.data.rooms.find((room) => {
        return room.participants.some(
          (participant) => participant._id === profileId
        );
      });

      if (targetRoom) {
        // Activate the chat with the found room
        setActiveChats((prevChats) =>
          prevChats.map((chat) => ({
            ...chat,
            active: chat.id === targetRoom._id,
          }))
        );
      }
    }
  }, [profileId, chats, recentConversation?.data?.rooms]);

  // console.log("activeChat", activeChat);

  const { uploadFiles } = useImageUploader();

  const handleSendImageMessage = async ({ text, images }) => {
    setImageUploading(true);

    // 1. Prepare local preview URLs for optimistic UI
    const localPreviews = images.map((file) => ({
      url: URL.createObjectURL(file),
      type: "image",
    }));

    // 2. Create a temporary message object
    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      type: "images",
      sender: "user",
      media: localPreviews,
      text,
      status: "sending",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setShowImageModal(false);

    // 3. Upload images
    let imageUrls = [];
    if (images && images.length > 0) {
      const uploadResult = await uploadFiles(images);
      if (uploadResult && uploadResult[0]?.success) {
        imageUrls = uploadResult[0].urls.map((url) => ({
          url,
          type: "image",
        }));
      }
    }

    // 4. Send message to backend
    createMessage(
      {
        content: text,
        type: "images",
        media: imageUrls,
        senderProfileId: currentUser,
        buyerProfileId: recentConversation?.data?.rooms.find(
          (room) => room._id === activeChatId
        )?.buyerProfile?._id,
        sellerProfileId: recentConversation?.data?.rooms.find(
          (room) => room._id === activeChatId
        )?.sellerProfile?._id,
      },
      {
        onSuccess: (res) => {
          // 5. Update the temp message to "sent" and replace media with real URLs
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? {
                    ...msg,
                    status: "sent",
                    media: imageUrls,
                    text,
                    // Optionally update id to res.data._id if you want
                  }
                : msg
            )
          );
          setImageUploading(false);
        },
        onError: () => {
          // 6. Mark as failed
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? { ...msg, status: "failed" } : msg
            )
          );
          toast.error("Failed to send images");
          setImageUploading(false);
        },
      }
    );
  };

  return (
    <div className="flex h-screen w-full relative">
      {/* Sidebar - responsive */}
      <div
        className={`
        ${sidebarOpen ? "translate-x-0 w-full" : "-translate-x-full"} 
        md:translate-x-0 md:w-1/3 lg:w-1/4
        fixed md:relative z-20 border-r border-gray-300 
        flex flex-col h-full bg-white transition-transform duration-300 ease-in-out
      `}
      >
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Chats list */}
        <div className="flex-1 overflow-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => changeActiveChat(chat.id)}
              className={`flex items-center p-3 cursor-pointer relative border-b border-gray-200 ${
                chat.active ? "bg-gradientlight" : "hover:bg-gradientlight"
              }`}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                {chat.avatar ? (
                  <Image
                    src={chat.avatar}
                    alt={chat.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-semibold">
                    {chat.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900 truncate">
                    {chat.name}
                  </span>
                  <span className="text-xs text-gray-500">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage}
                </p>
              </div>

              {chat.unread && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {activeChatId === undefined ? (
        <div className="w-full bg-white md:w-2/3 lg:w-3/4 flex flex-col h-full">
          <div className="flex items-center justify-center h-full">
            <h1 className="text-lg text-gray-500">
              Select a chat to start messaging
            </h1>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white md:w-2/3 lg:w-3/4 flex flex-col h-full">
          {/* Header */}
          <div className="bg-primary p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 md:pl-0">
              {/* Mobile Sidebar Toggle Button */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden text-white rounded-full"
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
                    className="lucide lucide-chevron-left-icon lucide-chevron-left"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
              )}
              <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-white">
                {activeChat?.avatar ? (
                  <Image
                    src={activeChat.avatar}
                    alt={activeChat.name}
                    className="object-cover"
                    sizes="40px"
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary bg-white font-semibold">
                    {activeChat?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <h1 className="text-lg text-white font-lg">{activeChat?.name}</h1>
            </div>
            <div className="flex items-center gap-2 text-white hover:bg-gradientlight rounded-full p-2">
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
                className="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user"
                    ? "justify-end"
                    : message.sender === "system"
                    ? "justify-center w-full"
                    : "justify-start"
                }`}
              >
                {message.type === "mission" ? (
                  <>
                    <div className="w-full max-w-none">
                      <ActivityCard
                        data={message.missionData}
                        activeTab="missions"
                        selectedMissionId={null}
                        setSelectedMissionId={() => {}}
                        renderBidsList={renderBidsList}
                      />
                      <div
                        className={`flex ${
                          message.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`relative text-md sm:max-w-md py-3 px-4 shadow-gray-300 shadow-md rounded-3xl ${
                            message.sender === "user"
                              ? "bg-[#F2E2D4] rounded-br-none"
                              : "bg-[#FBF2EC] rounded-bl-none"
                          } `}
                        >
                          <div className="absolute bottom-[-10px] left-[-5px]">
                            {message.sender === "user" ? (
                              ""
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden border-2 border-white">
                                {activeChat?.avatar ? (
                                  <Image
                                    src={activeChat?.avatar}
                                    alt={activeChat?.name}
                                    className="object-cover"
                                    width={24}
                                    height={24}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-primary bg-white font-semibold">
                                    {activeChat?.name?.charAt(0)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-end justify-between gap-2">
                            <p className="whitespace-pre-wrap break-words">
                              {message.text}
                            </p>

                            {/* Message status indicators */}
                            {message.sender === "user" && (
                              <div className="flex">
                                {message.status === "sending" && (
                                  <Clock size={13} className="text-gray-400" />
                                )}
                                {message.status === "sent" && (
                                  <Check size={13} className="text-gray-400" />
                                )}
                                {message.status === "delivered" && (
                                  <CheckCheck
                                    size={13}
                                    className="text-gray-400"
                                  />
                                )}
                                {message.status === "read" && (
                                  <CheckCheck
                                    size={13}
                                    className="text-secondary"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : message.type === "order" ? (
                  <OrderCard
                    Data={message}
                    onCancel={() => console.log("Order cancelled")}
                    onView={() => console.log("View order details")}
                  />
                ) : message.type === "payment" ? (
                  <PaymentCard data={message} pov={pov} />
                ) : message.type === "dueCard" ? (
                  <BookingAcceptedCard
                    data={message}
                    onViewOrder={() => console.log("View order details")}
                  />
                ) : message.type === "rating" ? (
                  pov !== "provider" && (
                    <RatingSlider
                      data={message}
                      currentUser={currentUser}
                      chatOrders={chatOrders}
                      provider={
                        recentConversation?.data?.rooms.find(
                          (room) => room._id === activeChatId
                        )?.sellerProfile?._id
                      }
                    />
                  )
                ) : message.type === "voucher" ? (
                  <div
                  // className={`flex ${
                  //   message.sender === "user"
                  //     ? "justify-end"
                  //     : "justify-start"
                  // }`}
                  >
                    <div className="max-w-[85%]">
                      <VoucherCard data={message.voucherData} />
                    </div>
                  </div>
                ) : message.type === "images" ? (
                  <ImageMessageCollage
                    images={message.images || message.media}
                    text={message.text || message.content}
                    data={message}
                  />
                ) : (
                  <div
                    className={`relative max-w-[85%] text-md sm:max-w-md py-3 px-4 shadow-gray-300 shadow-md rounded-3xl ${
                      message.sender === "user"
                        ? "bg-[#F2E2D4] rounded-br-none"
                        : "bg-[#FBF2EC] rounded-bl-none"
                    } `}
                  >
                    <div className="absolute bottom-[-10px] left-[-5px]">
                      {message.sender === "user" ? (
                        ""
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden border-2 border-white">
                          {activeChat?.avatar ? (
                            <Image
                              src={activeChat?.avatar}
                              alt={activeChat?.name}
                              className="object-cover"
                              width={24}
                              height={24}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary bg-white font-semibold">
                              {activeChat?.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <p className="whitespace-pre-wrap break-words overflow-hidden">
                        {message.text}
                      </p>

                      {/* Message status indicators */}
                      {message.sender === "user" && (
                        <div className="flex">
                          {message.status === "sending" && (
                            <Clock size={13} className="text-gray-400" />
                          )}
                          {message.status === "sent" && (
                            <Check size={13} className="text-gray-400" />
                          )}
                          {message.status === "delivered" && (
                            <CheckCheck size={13} className="text-gray-400" />
                          )}
                          {message.status === "read" && (
                            <CheckCheck size={13} className="text-secondary" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t w-[98%] mx-auto mb-4 flex flex-col border-gray-300 py-2">
            {pov === "provider" && (
              <div className=" flex items-center justify-center">
                <div className=" w-[50%] flex items-center justify-between gap-2 mb-2">
                  <div
                    onClick={() => SetShowPaymentRequest(true)}
                    className="hover:scale-110 transition-all duration-300"
                  >
                    <Image
                      src="/firstOpt.svg"
                      alt="logo"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div
                    onClick={() => router.push("/bookings")}
                    className="hover:scale-110 transition-all duration-300"
                  >
                    <Image
                      src="/secondOpt.svg"
                      alt="logo"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div
                    onClick={() => setShowVoucher(true)}
                    className="hover:scale-110 transition-all duration-300"
                  >
                    <Image
                      src="/thirdOpt.svg"
                      alt="logo"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div
                    onClick={() => setShowImageModal(true)}
                    className="hover:scale-110 transition-all duration-300"
                  >
                    <Image
                      src="/fourthOpt.svg"
                      alt="logo"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div
                    onClick={() => handleSendRating()}
                    className="hover:scale-110 transition-all duration-300"
                  >
                    <Image
                      src="/rating.svg"
                      alt="logo"
                      width={40}
                      height={40}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button className="rounded-full p-2 bg-primary text-gray-200 hover:bg-gradientdark">
                  <Plus size={20} />
                </button>
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`flex items-center justify-center rounded-full p-2 ${
                  input.trim()
                    ? "bg-primary text-white hover:bg-gradientdark"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
      {showVoucher && (
        <VoucherSystem
          setShowVoucher={setShowVoucher}
          buyer={
            recentConversation?.data?.rooms.find(
              (room) => room._id === activeChatId
            )?.buyerProfile
          }
          currentUser={currentUser}
          setMessages={setMessages}
          setSidebarLastMessages={setSidebarLastMessages}
          activeChatId={activeChatId}
          createMessage={createMessage}
          setIsSent={setIsSent}
          messagesEndRef={messagesEndRef}
        />
      )}
      {showPaymentRequest && (
        <PaymentModal
          SetShowPaymentRequest={SetShowPaymentRequest}
          handleSendSpecialMessage={handleSendSpecialMessage}
          chatOrders={chatOrders}
          currentUser={currentUser}
          setMessages={setMessages}
          setSidebarLastMessages={setSidebarLastMessages}
          activeChatId={activeChatId}
          createMessage={createMessage}
          setIsSent={setIsSent}
          messagesEndRef={messagesEndRef}
        />
      )}
      {showImageModal && (
        <ImageMessageModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          onSend={handleSendImageMessage}
          uploading={imageUploading}
        />
      )}
    </div>
  );
};

export default Chat;
