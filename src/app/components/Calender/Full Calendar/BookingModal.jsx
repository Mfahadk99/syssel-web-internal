import { X, Calendar, Clock, User, Mail, Phone } from "lucide-react";
import CustomCustomerDropdown from "./CustomerDropdown";
import CustomServiceDropdown from "./ServiceDropdown";

export function BookingModal({
  show,
  onClose,
  onSubmit,
  register,
  handleSubmit,
  reset,
  setValue,
  watch,
  errors,
  buyers,
  providerTotalServices,
  selectedSlot,
  selectedDateTime,
  setSelectedDateTime,
  setSelectedSlot,
  price,
  setPrice,
  createBookingMutation,
}) {
  if (!show || !selectedSlot) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl w-full max-w-lg mx-auto overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        <div className="px-6 pt-4 pb-4 bg-white sticky top-0 z-10 rounded-t-3xl flex items-center justify-between">
          <div className="flex-1">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 text-center">New Manual Booking</h3>
          </div>
          <button
            onClick={onClose}
            className="absolute right-6 top-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 overflow-y-auto flex-1" style={{ minHeight: 0 }}>
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-3">Customer</h4>
            <CustomCustomerDropdown
              value={watch("customer")}
              onChange={(value) => setValue("customer", value)}
              error={errors.customer}
              buyers={buyers}
            />
          </div>

          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-3">Service</h4>
            <CustomServiceDropdown
              value={watch("service")}
              onChange={(value) => setValue("service", value)}
              error={errors.service}
              services={providerTotalServices}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-medium text-gray-900">Comments</h4>
            </div>
            <textarea
              {...register("notes")}
              className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-none"
              placeholder="Add comments..."
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-medium text-gray-900">Date & Time</h4>
            </div>

            <div className="flex flex-col space-y-3">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <input
                  type="date"
                  value={selectedDateTime.date || selectedSlot.start.split("T")[0]}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    setSelectedDateTime((prev) => ({
                      ...prev,
                      date: selectedDate,
                    }));
                    setSelectedSlot((prev) => ({
                      ...prev,
                      start: `${selectedDate}T${prev.startTime}`,
                      date: selectedDate,
                    }));
                  }}
                  className="w-full bg-transparent border-0 text-gray-900 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3">
                <div className="bg-gray-50 rounded-xl px-4 py-3 flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={selectedDateTime.startTime || selectedSlot.startTime}
                    onChange={(e) => {
                      const newStartTime = e.target.value;
                      setSelectedDateTime((prev) => ({
                        ...prev,
                        startTime: newStartTime,
                      }));
                      setSelectedSlot((prev) => ({
                        ...prev,
                        startTime: newStartTime,
                      }));
                    }}
                    className="w-full bg-transparent border-0 text-gray-900 focus:outline-none"
                  />
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 flex-1">
                  <label className="block text-sm text-gray-600 mb-1">End Time</label>
                  <input
                    type="time"
                    value={selectedDateTime.endTime || selectedSlot.endTime}
                    onChange={(e) => {
                      const newEndTime = e.target.value;
                      setSelectedDateTime((prev) => ({
                        ...prev,
                        endTime: newEndTime,
                      }));
                      setSelectedSlot((prev) => ({
                        ...prev,
                        endTime: newEndTime,
                      }));
                    }}
                    className="w-full bg-transparent border-0 text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-gray-50 rounded-xl px-4 py-3 flex-1">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    className="w-full bg-transparent border-0 text-gray-900 focus:outline-none"
                  />
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 min-w-[80px] text-center">
                  <span className="text-sm font-medium text-gray-900">kr</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-white sticky bottom-0 z-10 rounded-b-3xl border-t border-gray-100">
            <button
              type="submit"
              disabled={createBookingMutation.isPending}
              className={`cursor-pointer w-full bg-primary text-white py-3 rounded-full font-semibold text-base hover:bg-primary-hover transition-colors duration-300 ${
                createBookingMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {createBookingMutation.isPending ? "Creating..." : "Add Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BookingDetailsModal({
  show,
  onClose,
  selectedBooking,
}) {
  if (!show || !selectedBooking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg w-full max-w-xl mx-4 relative flex flex-col overflow-hidden"
        style={{ maxHeight: "80vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800">Booking Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 flex-1" style={{ minHeight: 0 }}>
          <div className="p-2 bg-gray-50 rounded-lg mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {selectedBooking.date}
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Clock className="w-4 h-4 mr-2" />
              {selectedBooking.startTime} - {selectedBooking.endTime}
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Customer Information</h4>
            <div className="space-y-1">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">{selectedBooking.customer?.name || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">{selectedBooking.customer?.email || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">{selectedBooking.customer?.phone || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Service Information</h4>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Service:</span> {selectedBooking.service?.name || "N/A"}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Description:</span> {selectedBooking.service?.description || "N/A"}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Status Information</h4>
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 mr-2">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedBooking.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : selectedBooking.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedBooking.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedBooking.status}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 mr-2">Payment Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedBooking.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedBooking.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Payment Information</h4>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Amount:</span> ${selectedBooking.amount}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Payment Method:</span> {selectedBooking.paymentMethod}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 sticky bottom-0 bg-white z-10">
          <button
            onClick={onClose}
            className="cursor-pointer w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
