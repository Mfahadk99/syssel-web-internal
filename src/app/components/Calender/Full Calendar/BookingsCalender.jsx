"use client";
import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import toast from "react-hot-toast";
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  ChevronDown,
  Scissors,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCreateBooking } from "@/app/hooks/useBooking";
import { useGetAllProfilesBySearch } from "@/app/hooks/useProfile";
// import DummyProfileImage from "../../../../public/DummyProfileImage.png";
import DummyProfileImage from "../../../../../public/DummyProfileImage.png";
import {
  formatDuration,
  formatPrice,
  getStatusColor,
  getBusinessHours,
  isDateInPast,
  validateTimeRange,
  getEarliestWorkingHour,
  getLatestWorkingHour,
  formatTime,
  getCurrentWeekDates as getCurrentWeekDatesUtil,
  transformScheduleToWorkingHours,
  transformBookingsToEvents,
  calculateNewDatesFromView,
} from "@/app/utils/Calculations";
import { useGetWeekTimingsBySettingId } from "@/app/hooks/useSettings";
// import SimpleLogoLoader from "@/app/components/Loader/Loader";
import CustomCustomerDropdown from "./CustomerDropdown";
import CustomServiceDropdown from "./ServiceDropdown";
import SlidingButtons from "@/app/components/Reusable/SlidingButtons";
import { BookingModal, BookingDetailsModal } from "./BookingModal";

// Helper functions - define these outside the component
const getWeekDays = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days;
};

const getCurrentWeekDatesForHeader = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const FullCalendarBooking = ({
  bookingsData,
  providerTotalServices,
  providerId,
  settingId,
  isAuthLoading,
  bookingsLoading,
  isLoading,
  settings,
  isOpen: isSidebarOpen,
  isMobileOpen: isSidebarMobileOpen,
}) => {
  const { data: buyerProfiles, isLoading: buyerProfilesLoading } = useGetAllProfilesBySearch("");
  const appointmentSlotSize = settings?.calendarAndBooking?.appointmentSlotSize;
  const gapBetweenBookings = settings?.calendarAndBooking?.bufferTime;
  // Memoized buyers data
  const buyers = useMemo(
    () =>
      buyerProfiles?.data?.profiles?.map((profile) => ({
        id: profile._id,
        name: profile.name,
        email: profile.user?.email || "No email provided",
        coverImage: profile?.image || DummyProfileImage,
      })) || [],
    [buyerProfiles]
  );

  // Initialize current week dates
  const [currentViewDates, setCurrentViewDates] = useState(getCurrentWeekDatesUtil);
  const [currentWeekDates, setCurrentWeekDates] = useState(getCurrentWeekDatesForHeader);

  // Week timings hook
  const {
    data: weekTimingsResponse,
    isLoading: weekTimingsLoading,
    isError: weekTimingsError,
    refetch: refetchWeekTimings,
  } = useGetWeekTimingsBySettingId(settingId, currentViewDates.startDate, currentViewDates.endDate, {
    enabled: !!settingId,
    refetchOnWindowFocus: false,
    staleTime: 0,
    cacheTime: 0,
  });

  // Refetch when dates change
  useEffect(() => {
    if (settingId && currentViewDates.startDate && currentViewDates.endDate) {
      refetchWeekTimings();
    }
  }, [currentViewDates.startDate, currentViewDates.endDate, settingId, refetchWeekTimings]);

  const calendarRef = useRef(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [price, setPrice] = useState("");
  const [calendarView, setCalendarView] = useState("timeGridWeek");
  const [calendarTitle, setCalendarTitle] = useState("");
  const calendarViewButtons = [
    // { id: "dayGridMonth", label: "Month" },
    { id: "timeGridWeek", label: "Week" },
    { id: "timeGridDay", label: "Day" },
  ];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customer: "",
      provider: providerId,
      service: "",
      notes: "",
    },
  });

  // Memoized working hours
  const workingHours = useMemo(() => transformScheduleToWorkingHours(weekTimingsResponse), [weekTimingsResponse]);

  // Memoized provider settings
  const providerSettings = useMemo(
    () => ({
      slotDuration: appointmentSlotSize || 30,
      slotInterval: appointmentSlotSize || 30,
      gapBetweenBookings: gapBetweenBookings || 15,
      workingHours,
    }),
    [workingHours, appointmentSlotSize, gapBetweenBookings]
  );

  const createBookingMutation = useCreateBooking();

  useEffect(() => {
    if (calendarRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(calendarView);
      }, 200);
    }
  }, [isSidebarOpen, calendarView]);

  // Handle calendar view changes
  const handleDatesSet = useCallback((dateInfo) => {
    const newDates = calculateNewDatesFromView(dateInfo);
    setCurrentViewDates(newDates);
    setCalendarTitle(dateInfo.view.title);
    
    // Update week dates for headers
    if (dateInfo.view.type === 'timeGridWeek') {
      const startDate = new Date(dateInfo.start);
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }
      setCurrentWeekDates(dates);
    }
  }, []);

  // Memoized events
  const events = useMemo(() => transformBookingsToEvents(bookingsData), [bookingsData]);

  // Calendar resize handler
  const handleCalendarResize = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      setTimeout(() => calendarApi.updateSize(), 100);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleCalendarResize);
    return () => window.removeEventListener("resize", handleCalendarResize);
  }, [handleCalendarResize]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => handleCalendarResize());
    const calendarContainer = document.querySelector(".calendar-container");
    if (calendarContainer) {
      resizeObserver.observe(calendarContainer);
    }
    return () => resizeObserver.disconnect();
  }, [handleCalendarResize]);

  const handleDateSelect = (selectInfo) => {
    const { start, end } = selectInfo;

    if (isDateInPast(start)) {
      toast.error("Cannot create bookings for past dates");
      return;
    }

    const dayOfWeek = start.getDay();
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = dayNames[dayOfWeek];
    const workingDay = providerSettings.workingHours[dayName];

    if (!workingDay.active) {
      toast.error("This day is not available for bookings.");
      return;
    }

    const startTime = formatTime(start);
    const endTime = formatTime(end);

    if (startTime < workingDay.start || endTime > workingDay.end) {
      toast.error("Selected time is outside working hours.");
      return;
    }

    setSelectedSlot({
      start: start.toISOString(),
      end: end.toISOString(),
      startTime: startTime,
      endTime: endTime,
      date: start.toLocaleDateString(),
    });

    setSelectedDateTime({
      date: start.toISOString().split("T")[0],
      startTime: startTime,
      endTime: endTime,
    });

    setShowBookingModal(true);
  };

  const handleEventClick = (clickInfo) => {
    const { event } = clickInfo;

    if (!event || !event.start || !event.end) return;

    const booking = {
      id: event.id,
      title: event.title,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      startTime: event.start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      endTime: event.end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: event.start.toLocaleDateString(),
      ...event.extendedProps,
    };

    setSelectedBooking(booking);
    setShowBookingDetailsModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const newBooking = {
        customer: data.customer,
        provider: providerId,
        service: data.service,
        slot: {
          date: selectedSlot.start.split("T")[0],
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        },
        amount: Number(price) || 0,
        isManual: true,
        paymentMethod: "cash",
      };

      await createBookingMutation.mutateAsync(newBooking);
      toast.success("Booking created successfully!");

      setShowBookingModal(false);
      reset();
      setSelectedSlot(null);
      setPrice("");
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
    }
  };

  const handleViewChange = (view) => {
    setCalendarView(view);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(view);
    }
  };

  // if (buyerProfilesLoading || isAuthLoading || bookingsLoading || isLoading) {
  //   return <SimpleLogoLoader />;
  // }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Booking Calendar</h1>
            <p className="text-gray-600 mt-1">Manage your appointments and bookings</p>
          </div>
          <div className="flex items-center space-x-3">
            {weekTimingsLoading && <div className="text-sm text-blue-600">Loading schedule...</div>}
            {weekTimingsError && <div className="text-sm text-red-600">Error loading schedule</div>}
          </div>
        </div>

        <div className="relative">
          <div className="bg-skin rounded-full shadow-md flex items-center justify-between px-4 py-2 mb-2 ">
            {/* Left: empty for spacing */}
            <div className="md:w-[10%]" />
            {/* Center: Prev Icon, Title, Next Icon */}
            <div className="flex-1 flex items-center justify-center gap-2">
              <button
                onClick={() => calendarRef.current.getApi().prev()}
                className="p-2 rounded-full cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 bg-primary rounded-full text-white" />
              </button>
              <span className="font-bold text-sm md:text-lg whitespace-nowrap">{calendarTitle}</span>
              <button
                onClick={() => calendarRef.current.getApi().next()}
                className="p-2 rounded-full cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 bg-primary rounded-full text-white" />
              </button>
            </div>
            {/* Right: SlidingButtons */}
            <div>
              <SlidingButtons
                buttons={calendarViewButtons}
                activeButton={calendarView}
                setActiveButton={handleViewChange}
              />
            </div>
          </div>
          {/* Custom Days Header */}
          <div className="custom-days-header">
            <div className="flex">
              {/* Week number column */}
              <div className="w-16 flex-shrink-0 flex flex-col items-center justify-center py-3">
                <div className="text-sm text-primary font-medium">Week</div>
                <div className="text-2xl font-bold text-primary">
                  {getWeekNumber(currentWeekDates[0])}
                </div>
              </div>
              
              {/* Day headers */}
              {currentWeekDates.map((date, index) => (
                <div 
                  key={index} 
                  className="flex-1 min-w-0 text-center py-3 px-2"
                >
                  <div className="text-sm font-semibold text-primary">
                    {getWeekDays()[index]}
                  </div>
                  <div className="text-2xl text-primary mt-1">
                    {date.getDate().toString().padStart(2, '0')}/{date.getMonth().toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Calendar Container */}
          <div className="custom-calendar-width">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={calendarView}
              headerToolbar={false}
              firstDay={1}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              eventColor="#7f4665"
              eventBorderColor="#7f4665"
              eventTextColor="white"
              select={handleDateSelect}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              businessHours={getBusinessHours(providerSettings.workingHours)}
              slotDuration={`00:${providerSettings.slotInterval}:00`}
              slotLabelInterval={`00:${providerSettings.slotInterval}:00`}
              selectConstraint="businessHours"
              eventConstraint="businessHours"
              height="auto"
              allDaySlot={false}
              slotMinTime={getEarliestWorkingHour(providerSettings.workingHours)}
              slotMaxTime={getLatestWorkingHour(providerSettings.workingHours)}
              nowIndicator={true}
              selectAllow={(selectInfo) => {
                const duration = selectInfo.end - selectInfo.start;
                const minDuration = providerSettings.slotDuration * 60 * 1000;
                return duration >= minDuration;
              }}
              eventResizableFromStart={true}
              eventDurationEditable={true}
              eventStartEditable={true}
              selectMinDistance={10}
              slotLabelClassNames="text-gray-600 text-sm"
              windowResizeDelay={100}
              snapDuration={`00:${providerSettings.slotInterval}:00`}
              slotEventOverlap={false}
              eventOverlap={false}
              // Hide the default header
              columnHeaderFormat={{ weekday: 'short' }}
              eventContent={(eventInfo) => {
                return (
                  <div className="p-1 h-full overflow-hidden">
                    <div className="font-medium text-white text-sm truncate">{eventInfo.event.title}</div>
                    <div className="text-xs text-white opacity-90 truncate">
                      {eventInfo.event.extendedProps.service?.name || "Service"}
                    </div>
                    <div className="text-xs text-white opacity-90 capitalize">
                      {eventInfo.event.extendedProps.status}
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </div>

      <BookingModal
        show={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          reset();
          setSelectedSlot(null);
          setPrice("");
        }}
        onSubmit={onSubmit}
        register={register}
        handleSubmit={handleSubmit}
        reset={reset}
        setValue={setValue}
        watch={watch}
        errors={errors}
        buyers={buyers}
        providerTotalServices={providerTotalServices}
        selectedSlot={selectedSlot}
        selectedDateTime={selectedDateTime}
        setSelectedDateTime={setSelectedDateTime}
        setSelectedSlot={setSelectedSlot}
        price={price}
        setPrice={setPrice}
        createBookingMutation={createBookingMutation}
      />
      <BookingDetailsModal
        show={showBookingDetailsModal}
        onClose={() => setShowBookingDetailsModal(false)}
        selectedBooking={selectedBooking}
      />
    </div>
  );
};

export default FullCalendarBooking;
