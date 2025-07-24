"use client";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { X, ChevronLeft, ChevronRight, Check, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateBooking, useGetAllTodaySlots } from "@/app/hooks/useBooking";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";


const Calender = ({ isOpen, onClose, customer, provider, service, amount }) => {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const createBooking = useCreateBooking();
  const { data: slotsData, isLoading: isLoadingSlots } = useGetAllTodaySlots(
    provider,
    selectedDate ? moment(selectedDate).format("YYYY-MM-DD") : null,
    { enabled: !!provider && !!selectedDate }
  );

  const todaySlotsQuery = useGetAllTodaySlots(provider, selectedDate, {
    enabled: !!provider && !!selectedDate,
  });

  const handleDateSelect = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const today = moment().format("YYYY-MM-DD");

    // Check if the date is in the past
    if (moment(formattedDate).isBefore(today, "day")) {
      toast.error("Cannot book past dates");
      return;
    }

    setSelectedDate(formattedDate);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot({
      id: `${slot.startTime}-${slot.endTime}`,
      time: `${slot.startTime} - ${slot.endTime}`,
      label: `${moment(slot.startTime, "HH:mm").format("h:mm A")} - ${moment(
        slot.endTime,
        "HH:mm"
      ).format("h:mm A")}`,
    });
  };

  // const handleBooking = async () => {
  //   if (selectedDate && selectedTimeSlot) {
  //     try {
  //       // Show loading toast
  //       const loadingToast = toast.loading('Processing your booking...');

  //       // Parse the time slot to get start and end times
  //       const [startTime, endTime] = selectedTimeSlot.time.split(' - ');

  //       const bookingData = {
  //         customer,
  //         provider,
  //         service,
  //         slot: {
  //           date: selectedDate,
  //           startTime,
  //           endTime
  //         },
  //         amount,
  //         isManual: false,
  //         paymentMethod: "cash"
  //       };

  //       // Create the booking using the mutation
  //       await createBooking.mutateAsync(bookingData);

  //             // ✅ Invalidate the query to refetch updated slots
  //     queryClient.invalidateQueries({
  //       queryKey: [BOOKING_KEY, "available-slots", provider, selectedDate],
  //     });

  //       // Dismiss loading toast
  //       toast.dismiss(loadingToast);

  //       // Show success toast
  //       toast.success('Booking confirmed successfully!');
  //       onClose();
  //     } catch (error) {
  //       // Handle error
  //       toast.error(error.response?.data?.message || 'Failed to create booking');
  //     }
  //   }
  // };



  const handleBooking = async () => {
    if (selectedDate && selectedTimeSlot) {
      try {
        const loadingToast = toast.loading("Processing your booking...");

        const [startTime, endTime] = selectedTimeSlot.time.split(" - ");

        const bookingData = {
          customer,
          provider,
          service,
          slot: {
            date: selectedDate,
            startTime,
            endTime,
          },
          amount,
          isManual: false,
          paymentMethod: "cash",
        };

        console.log("bookingData", bookingData);

        await createBooking.mutateAsync(bookingData);

        toast.dismiss(loadingToast);
        toast.success("Booking confirmed successfully!");

        // router.push(`/chat?profileId=${bookingData.provider}`);
        router.push(`/chat?profileId=${bookingData.provider}&currentUser=${bookingData.customer}`);

        // setSelectedSlot(null); // Clear selected slot
        todaySlotsQuery.refetch(); // Refresh slots
        onClose();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to create booking"
        );
      }
      // ✅ Refetch the available slots after successful booking
      queryClient.invalidateQueries({
        queryKey: [BOOKING_KEY, "available-slots", provider, selectedDate],
      });
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(moment(currentMonth).add(direction, "months"));
  };

  const renderCalendarDays = () => {
    const monthStart = moment(currentMonth).startOf("month");
    const monthEnd = moment(currentMonth).endOf("month");
    const startDate = moment(monthStart).startOf("week");
    const endDate = moment(monthEnd).endOf("week");

    const rows = [];
    let days = [];
    let day = startDate;

    // Days of week header
    const daysOfWeek = [
      { id: "sun", label: "S" },
      { id: "mon", label: "M" },
      { id: "tue", label: "T" },
      { id: "wed", label: "W" },
      { id: "thu", label: "T" },
      { id: "fri", label: "F" },
      { id: "sat", label: "S" },
    ];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = moment(day);
        const formattedDate = cloneDay.format("YYYY-MM-DD");
        const isCurrentMonth = cloneDay.month() === monthStart.month();
        const isSelected = selectedDate === formattedDate;

        let dayClass =
          "w-8 h-8 flex items-center justify-center rounded-full mx-auto";

        if (!isCurrentMonth) {
          dayClass += " text-gray-300";
        } else if (moment(formattedDate).isBefore(moment(), "day")) {
          dayClass += " text-gray-300 cursor-not-allowed";
        } else if (isSelected) {
          dayClass += " bg-error-dark text-white cursor-pointer";
        } else {
          dayClass += " hover:bg-gray-100 cursor-pointer";
        }

        days.push(
          <div key={day.format("YYYY-MM-DD")} className="text-center py-1">
            <button
              className={dayClass}
              onClick={() => {
                if (
                  isCurrentMonth &&
                  !moment(formattedDate).isBefore(moment(), "day")
                ) {
                  handleDateSelect(formattedDate);
                }
              }}
              disabled={
                !isCurrentMonth ||
                moment(formattedDate).isBefore(moment(), "day")
              }
            >
              {cloneDay.format("D")}
            </button>
          </div>
        );
        day = moment(day).add(1, "days");
      }
      rows.push(
        <div
          key={day.format("YYYY-MM-DD") + "row"}
          className="grid grid-cols-7 gap-1"
        >
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day.id} className="text-center font-medium text-gray-600">
              {day.label}
            </div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto p-5 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <button
            className="p-1 text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-medium text-gray-800">
            {currentMonth.format("MMMM YYYY")}
          </h2>
          <button
            className="p-1 text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={() => navigateMonth(1)}
          >
            <ChevronRight size={20} />
          </button>
          <button
            className="ml-auto p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">{renderCalendarDays()}</div>

        {selectedDate && (
          <div className="mt-5">
            <h3 className="text-md font-medium text-gray-800 mb-4 flex items-center">
              <Clock size={14} className="mr-2" />
              {isLoadingSlots
                ? "Loading available slots..."
                : slotsData?.slots?.length > 0
                ? "Select a time slot"
                : "No available times"}
            </h3>

            {isLoadingSlots ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              slotsData?.slots?.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {slotsData.slots.map((slot) => (
                    <div
                      key={`${slot.startTime}-${slot.endTime}`}
                      className={`border rounded-full py-2 px-3 text-center cursor-pointer transition-colors flex items-center justify-center ${
                        selectedTimeSlot?.id ===
                        `${slot.startTime}-${slot.endTime}`
                          ? "bg-error-dark text-white border-error-darker"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                      onClick={() => handleTimeSlotSelect(slot)}
                    >
                      {selectedTimeSlot?.id ===
                        `${slot.startTime}-${slot.endTime}` && (
                        <Check size={16} className="mr-1" />
                      )}
                      {`${moment(slot.startTime, "HH:mm").format(
                        "h:mm A"
                      )} - ${moment(slot.endTime, "HH:mm").format("h:mm A")}`}
                    </div>
                  ))}
                </div>
              )
            )}

            {selectedTimeSlot && (
              <button
                className="mx-auto w-1/2 py-2 px-4 rounded-full font-medium text-white bg-error-dark hover:bg-error-darker flex items-center justify-center transition-colors duration-300 cursor-pointer"
                onClick={handleBooking}
              >
                <Check size={18} className="mr-2" />
                Confirm Booking
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calender;
