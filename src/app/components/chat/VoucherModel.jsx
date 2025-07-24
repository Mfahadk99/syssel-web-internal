"use client";
import { useState } from "react";
import { X, ChevronLeft, ChevronDown, Upload, Trash2 } from "lucide-react";
// import { VoucherCard } from "../Reusable/Card";
import SlidingButtons from "../Reusable/SlidingButtons";
import useAuthStore from "@/app/store/useAuthStore";
import { useGetServiceByProviderId } from "@/app/hooks/useServices";
import Image from "next/image";
import Ratings from "../Reusable/Ratings";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useCreateVoucher } from "../../hooks/useVoucher";
import { useGetProfileById } from "../../hooks/useProfile";
import useImageUploader from "@/app/utils/imgUpload";

const tabData = [
  { id: "SERVICE", label: "Service" },
  { id: "STORE", label: "Store" },
];

const VoucherPreviewCard = ({ data }) => {
  if (!data) return null;
  const {
    title,
    images,
    amount,
    rating,
    about,
    distance,
    expiryDate,
    voucherValue,
    serviceName,
  } = data;

  return (
    <div className="flex h-40 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-primary border-dashed">
      {/* Image container */}
      <div className="relative h-full w-25 flex-shrink-0">
        {images && images.length > 0 && (
          <Image
            src={images[0].url || images[0]} // handle both file and url
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 96px, 176px"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-[#e8e8ca] py-1 text-black text-xs font-bold text-center">
          VOUCHER
        </div>
      </div>
      {/* Content container */}
      <div className="p-4 flex-grow relative">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <div className="bg-[#632d41] text-white text-sm font-semibold px-2 py-0.5 rounded">
            {amount ? `${amount} kr` : "0 kr"}
          </div>
        </div>
        {/* Rating */}
        <div className="mt-1">
          <Ratings rating={rating || 0} showNumber={true} size="text-lg" />
        </div>
        {/* Description */}
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{about}</p>
        {/* Distance and expiry date at bottom */}
        <div className="flex items-center justify-between mt-2 text-sm">
          <div className="flex items-center text-gray-700">
            <FaMapMarkerAlt className="mr-1" />
            <span>{distance ? `${distance} meters` : "0 meters"}</span>
          </div>
          <div className="text-gray-600 text-xs">{expiryDate}</div>
        </div>
      </div>
    </div>
  );
};

// Move Modal1 outside the main component to prevent re-creation
const Modal1 = ({
  customer = "customer",
  setShowVoucher,
  setCurrentModal,
  isEditing,
  setIsEditing,
  activeTab,
  setActiveTab,
  formData,
  handleInputChange,
  handleImageUpload,
  removeImage,
  voucherConfig,
  providerTotalServices,
}) => {
  // Validation: all required fields must be filled
  const isFormValid =
    formData.amount > 0 &&
    formData.title.trim() !== "" &&
    formData.about.trim() !== "" &&
    formData.expiryDate.trim() !== "" &&
    (activeTab !== "SERVICE" || formData.service);

  return (
    <div className="flex flex-col bg-white rounded-3xl w-lg max-w-full h-[90vh]">
      {/* Fixed Header */}
      <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-semibold">Create new voucher</h2>
          <p className="text-gray-500 text-sm">For: {customer}</p>
        </div>
        <button
          onClick={() => setShowVoucher(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6">
        {/* Amount Section */}
        <div className="text-center py-4">
          <div className="text-center text-4xl font-bold text-primary mb-1">
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    handleInputChange(
                      "amount",
                      value === "" ? 0 : parseInt(value)
                    );
                  }}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditing(false);
                    }
                  }}
                  autoFocus
                  className="text-4xl font-bold text-blue-900 bg-transparent text-center focus:outline-none"
                  placeholder="Enter amount"
                  required
                />
              </div>
            ) : (
              <div>
                <span
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer hover:text-primary transition-colors"
                >
                  {formData.amount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            Including {voucherConfig.mvaRate}% MVA
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="py-4">
          <SlidingButtons
            buttons={tabData}
            activeButton={activeTab}
            setActiveButton={setActiveTab}
            className="bg-gray-100 max-w-fit mx-auto shadow-inner"
            buttonClassName="py-2 px-6 flex items-center justify-center gap-2"
            activeButtonClassName="text-white"
            inactiveButtonClassName="text-gray-500"
          />
        </div>

        {/* Service Selection */}
        {activeTab === "SERVICE" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.service}
                onChange={(e) => handleInputChange("service", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white"
                required
              >
                <option value="">Select a service</option>
                {providerTotalServices.map((service, index) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>
        )}

        {/* Title Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter voucher title"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

        {/* About Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            About <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.about}
            onChange={(e) => handleInputChange("about", e.target.value)}
            placeholder="Describe your voucher..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            required
          />
        </div>

        {/* Image Upload Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Images
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              id="imageUpload"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label
              htmlFor="imageUpload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <Upload className="text-gray-400 mb-2" size={24} />
              <span className="text-sm text-gray-500">
                Click to upload images
              </span>
            </label>
          </div>

          {/* Image Preview */}
          {formData.images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {formData.images.map((image, index) => (
                <div key={index} className="relative h-20">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiry Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="p-6 pt-4 border-t border-gray-100">
        <button
          onClick={() => setCurrentModal(2)}
          className={`w-full bg-[var(--color-primary)] text-white py-3 rounded-3xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors duration-300 ${
            !isFormValid ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!isFormValid}
        >
          Review Voucher
        </button>
      </div>
    </div>
  );
};

// Move Modal2 outside as well
const Modal2 = ({
  setCurrentModal,
  activeTab,
  setShowVoucher,
  formData,
  voucherConfig,
  calculateMVA,
  calculateTotalCharge,
  handleRequestPayment,
  isLoading,
  customer
}) => (
  <div className="bg-white rounded-3xl p-6 w-lg max-w-full">
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={() => setCurrentModal(1)}
        className="text-gray-400 hover:text-gray-600"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="flex-1 text-center">
        <h2 className="text-xl font-semibold">Create new voucher</h2>
        <p className="text-gray-500 text-sm">
          For: {customer || ""}
        </p>
      </div>
      <button
        onClick={() => setShowVoucher(false)}
        className="text-gray-400 hover:text-gray-600"
      >
        <X size={24} />
      </button>
    </div>

    <div className="text-center mb-6">
      <div className="text-4xl font-bold text-blue-900 mb-1">
        {formData.amount?.toLocaleString()} kr
      </div>
      <p className="text-gray-500 text-sm">
        Including {voucherConfig.mvaRate}% MVA
      </p>
    </div>

    {/* Voucher Preview */}
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6">
      <VoucherPreviewCard data={formData} />
    </div>
    {/* Payment Details */}
    <div className="space-y-3 mb-6">
      <div className="flex justify-between">
        <span className="text-gray-600">MVA:</span>
        <span>{calculateMVA()} kr</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Transaction fee:</span>
        <span>{voucherConfig.transactionFee}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Charge:</span>
        <span>{calculateTotalCharge().toLocaleString()}kr</span>
      </div>
      <div className="border-t pt-3">
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{formData.amount?.toLocaleString()} kr</span>
        </div>
      </div>
    </div>

    <button
      className="w-full bg-[var(--color-primary)] text-white py-3 rounded-3xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
      onClick={handleRequestPayment}
      disabled={isLoading}
    >
      {isLoading ? "Creating Voucher..." : "Request Payment"}
    </button>
  </div>
);

const VoucherSystem = ({
  setShowVoucher,
  buyer,
  currentUser,
  setMessages,
  setSidebarLastMessages,
  activeChatId,
  createMessage,
  setIsSent,
  messagesEndRef,
}) => {
  const { currentProfile } = useAuthStore();
  const { data: servicesData } = useGetServiceByProviderId(currentProfile?._id);
  const providerServices = servicesData?.data || [];
  const providerTotalServices =
    providerServices.map((service) => ({
      id: service._id,
      name: service.name.trim(),
    })) || [];

  const { data: profileData } = useGetProfileById(currentUser);

  console.log(
    profileData?.data.ratings?.buyerToProvider?.averageRating,
    "profileee"
  );

  const { mutate: createVoucher, isLoading } = useCreateVoucher();

  const [currentModal, setCurrentModal] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("SERVICE");
  const [formData, setFormData] = useState({
    amount: 0,
    mva: 20,
    expiryDate: "",
    service: "",
    title: "",
    about: "",
    voucherValue: "",
    images: [],
    customerName: "",
    distance: 0,
  });

  const { uploadFiles, uploading, error } = useImageUploader();

  // Voucher configuration object
  const voucherConfig = {
    mvaRate: 20,
    transactionFee: 0,
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const calculateTotalCharge = () => {
    const mvaAmount = (formData.amount * voucherConfig.mvaRate) / 100;
    return formData.amount - mvaAmount;
  };

  const calculateMVA = () => {
    return (formData.amount * voucherConfig.mvaRate) / 100;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // --- Handle Request Payment ---
  const handleRequestPayment = async () => {
    // 1. Upload images first
    const filesToUpload = formData.images
      .map((img) => img.file)
      .filter(Boolean); // Only File objects

    let voucherId = "";
    let imageUrls = [];
    if (filesToUpload.length > 0) {
      const uploadResult = await uploadFiles(filesToUpload);
      if (uploadResult && uploadResult[0]?.success) {
        imageUrls = uploadResult[0].urls;
      } else {
        // handle error
        alert(
          "Image upload failed: " + (uploadResult[0]?.error || "Unknown error")
        );
        return;
      }
    } else {
      // If no new files, use existing URLs (for already uploaded images)
      imageUrls = formData.images.map((img) => img.url || img);
    }

    // 2. Voucher create body
    const body = {
      providerId: currentProfile?._id,
      buyers: [],
      type: activeTab,
      ...(activeTab === "SERVICE" && formData.service
        ? { serviceId: formData.service }
        : {}),
      images: imageUrls,
      title: formData.title,
      about: formData.about,
      voucherValue: Number(formData.amount),
      validity: formData.expiryDate,
      status: "active",
    };

    // 3. Create voucher
    createVoucher(body, {
      onSuccess: (res) => {
        voucherId = res.data?.voucher?._id;
        const senderId = currentUser;
        if (!senderId) {
          console.error("❌ senderId is missing");
          return;
        }

        let newVoucherMessage = {
          id: Date.now(),
          sender: "system",
          status: "sent",
          type: "voucher",
          voucherData: {
            name: formData.title,
            image: imageUrls,
            price: Number(formData.amount),
            rating:
              profileData.data?.ratings?.buyerToProvider?.averageRating || 0,
            description: formData.about,
            distance: Math.floor(Math.random() * 900) + 100, // random 3-digit number in meters
            expiryDate: formData.expiryDate,
          },
        };

        let newPaymentMessage = {
          id: Date.now(),
          sender: "user",
          status: "sent",
          type: "payment",
          paymentData: {
            amount: Number(formData.amount),
            method: "",
            isPaid: false,
            // booking:
          },
          isPaid: false,
        };

        setMessages((prev) => [...prev, newVoucherMessage, newPaymentMessage]);
        setSidebarLastMessages((prev) => ({
          ...prev,
          [activeChatId]: {
            content: "Voucher...",
            createdAt: new Date().toISOString(),
          },
        }));

        //  scrollToEnd
        setTimeout(() => {
          messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        
        const VoucherPayload = {
          content: `Voucher`,
          senderProfileId: currentUser,
          buyerProfileId: buyer.id,
          sellerProfileId: currentUser,
          type: "voucher",
          voucher: voucherId,
        };

        createMessage(VoucherPayload, {
          onSuccess: (res) => {
            

            ///////////////////////////////////////////////////

            const paymentPayload = {
              content: `Voucher Payment...`,
              senderProfileId: currentUser,
              buyerProfileId: buyer.id,
              sellerProfileId: currentUser,
              voucher: voucherId,
              type: "payment",
              payment: {
                amount: Number(formData.amount),
                isPaid: false,
              },
            };

            createMessage(paymentPayload, {
              onSuccess: (res) => {
                
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === newPaymentMessage.id ? { ...msg, status: "sent" } : msg
                  )
                );
                console.log("successss");
    
                setIsSent(true);
                console.log("🔍 res: ", res.data.roomId);
              },
              onError: (err) => {
                
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === newPaymentMessage.id ? { ...msg, status: "failed" } : msg
                  )
                );
                console.log("failedd");
    
                console.error("❌ Failed to send message:", err);
              },
              onSettled: () => {
                setIsSent(false);
              },
            });

            //////////////////////////////////////////////////

            SetShowPaymentRequest(false);

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === newVoucherMessage.id ? { ...msg, status: "sent" } : msg
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
                msg.id === newVoucherMessage.id ? { ...msg, status: "failed" } : msg
              )
            );
            console.log("failedd");

            console.error("❌ Failed to send message:", err);
          },
          onSettled: () => {
            setIsSent(false);
          },
        });

        

        setShowVoucher(false);
      },
      onError: (err) => {
        alert("Voucher create failed");
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {currentModal === 1 && (
        <Modal1
          setShowVoucher={setShowVoucher}
          setCurrentModal={setCurrentModal}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          formData={formData}
          handleInputChange={handleInputChange}
          handleImageUpload={handleImageUpload}
          removeImage={removeImage}
          customer={buyer?.name}
          voucherConfig={voucherConfig}
          providerTotalServices={providerTotalServices}
        />
      )}
      {currentModal === 2 && (
        <Modal2
          setCurrentModal={setCurrentModal}
          activeTab={activeTab}
          setShowVoucher={setShowVoucher}
          formData={formData}
          customer={buyer?.name}
          voucherConfig={voucherConfig}
          calculateMVA={calculateMVA}
          calculateTotalCharge={calculateTotalCharge}
          handleRequestPayment={handleRequestPayment}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default VoucherSystem;
