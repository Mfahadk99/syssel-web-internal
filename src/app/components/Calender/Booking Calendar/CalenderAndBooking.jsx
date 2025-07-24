"use client";
import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { ChevronLeft, ChevronRight, ClipboardList, ClipboardCheck } from "lucide-react";
import { useUpdateSettings, useUpdateCalendarTime } from "@/app/hooks/useSettings";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useGetWeekTimingsBySettingId } from "@/app/hooks/useSettings";
import { getCurrentWeekDates, getWeekDatesFromDate } from "@/app/utils/Calculations";
// import SimpleLogoLoader from "../../Loader/Loader";

export default function CalendarBooking({ settingId, calendarSettings }) {
  const [currentViewDates, setCurrentViewDates] = useState(getCurrentWeekDates);
  const updateSettingsMutation = useUpdateSettings(settingId);
  const updateCalendarTimeMutation = useUpdateCalendarTime(settingId);
  const copiedShiftsRef = useRef(null);

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

  const weekTimings = weekTimingsResponse?.data?.schedule;

  // Refetch when dates change
  useEffect(() => {
    if (settingId && currentViewDates.startDate && currentViewDates.endDate) {
      refetchWeekTimings();
    }
  }, [currentViewDates.startDate, currentViewDates.endDate, settingId, refetchWeekTimings]);


  // Function to transform weekTimings and calendarSettings into form structure
  const getFormDefaultValues = (calendarSettings, weekTimings) => {
    // Transform weekTimings data into workShifts array
    const workShiftsFromWeekTimings = weekTimings?.map((daySchedule) => ({
      day: daySchedule.day.charAt(0).toUpperCase() + daySchedule.day.slice(1), // Capitalize first letter
      open: daySchedule.startTime || "",
      close: daySchedule.endTime || "",
      isOpen: daySchedule.isWorking || false,
      date: daySchedule.date,
      isCustomOverride: daySchedule.isCustomOverride || false,
    })) || null;

    return {
      // Use calendarSettings from database for non-timing related settings, fallback to defaults
      timezone: calendarSettings?.timeZone || "GMT +1",
      appointmentSlotSize: calendarSettings?.appointmentSlotSize?.toString() || "30",
      minimumGapBetweenBookings: calendarSettings?.bufferTime?.toString() || "20",
      allowOutsideBooking: calendarSettings?.allowOutsideBooking || false,
      googleSync: calendarSettings?.googleSync || false,
      allowDirectBooking: calendarSettings?.allowDirectBooking || false,
      autoAcceptBookings: calendarSettings?.autoAcceptBookings || false,
      standardShiftWeeks: calendarSettings?.standardShiftsCount || 6,

      // Use weekTimings for work shifts, fallback to default schedule
      workShifts: workShiftsFromWeekTimings || [
        { day: "Monday", open: "10:00", close: "18:00", isOpen: true },
        { day: "Tuesday", open: "10:00", close: "18:00", isOpen: true },
        { day: "Wednesday", open: "10:00", close: "18:00", isOpen: true },
        { day: "Thursday", open: "10:00", close: "18:00", isOpen: true },
        { day: "Friday", open: "10:00", close: "18:00", isOpen: true },
        { day: "Saturday", open: "10:00", close: "18:00", isOpen: true },
        { day: "Sunday", open: "", close: "", isOpen: false },
      ],
    };
  };

  // React Hook Form setup with empty defaults initially
  const { control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      timezone: "GMT +1",
      appointmentSlotSize: "30",
      minimumGapBetweenBookings: "20",
      allowOutsideBooking: false,
      googleSync: false,
      allowDirectBooking: false,
      autoAcceptBookings: false,
      standardShiftWeeks: 6,
      workShifts: [
        { day: "Monday", open: "10:00", close: "18:00", isOpen: true },
        { day: "Tuesday", open: "10:00", close: "18:00", isOpen: true },
        { day: "Wednesday", open: "10:00", close: "18:00", isOpen: true },
        { day: "Thursday", open: "10:00", close: "18:00", isOpen: true },
        { day: "Friday", open: "10:00", close: "18:00", isOpen: true },
        { day: "Saturday", open: "10:00", close: "18:00", isOpen: true },
        { day: "Sunday", open: "", close: "", isOpen: false },
      ],
    },
  });

  // Watch form values for reactive UI
  const watchedValues = watch();
  const workShifts = watch("workShifts");

  // Use reset to populate form with database data when weekTimings or calendarSettings are available
  useEffect(() => {
    if (calendarSettings && weekTimings) {
      const formData = getFormDefaultValues(calendarSettings, weekTimings);
      reset(formData);
    }
  }, [calendarSettings, weekTimings, reset]);

  // Updated week navigation handlers
  const goToPreviousWeek = () => {
    const currentStartDate = new Date(currentViewDates.startDate);
    currentStartDate.setDate(currentStartDate.getDate() - 7);
    const newDates = getWeekDatesFromDate(currentStartDate);
    setCurrentViewDates(newDates);
  };

  const goToNextWeek = () => {
    const currentStartDate = new Date(currentViewDates.startDate);
    currentStartDate.setDate(currentStartDate.getDate() + 7);
    const newDates = getWeekDatesFromDate(currentStartDate);
    setCurrentViewDates(newDates);
  };

  if (!calendarSettings) return <div className="flex justify-center items-center min-h-64 text-lg">Loading...</div>;

  // Toggle day active state
  const toggleDayActive = (index) => {
    const currentWorkShifts = watch("workShifts");
    const updatedWorkShifts = [...currentWorkShifts];
    updatedWorkShifts[index].isOpen = !updatedWorkShifts[index].isOpen;
    setValue("workShifts", updatedWorkShifts);
  };

  // Handle time change
  const handleTimeChange = (index, field, value) => {
    const currentWorkShifts = watch("workShifts");
    const updatedWorkShifts = [...currentWorkShifts];
    updatedWorkShifts[index][field] = value;
    setValue("workShifts", updatedWorkShifts);
  };

  // Form submission handler for general settings
  const onSubmitGeneralSettings = (data) => {

    // Transform form data to match API structure
    const apiData = {
      calendarAndBooking: {
        bufferTime: parseInt(data.minimumGapBetweenBookings),
        appointmentSlotSize: parseInt(data.appointmentSlotSize),
        allowOutsideBooking: data.allowOutsideBooking,
        googleSync: data.googleSync,
        allowDirectBooking: data.allowDirectBooking,
        autoAcceptBookings: data.autoAcceptBookings,
        timeZone: data.timezone,
        standardShiftsCount: data.standardShiftWeeks,
      },
    };


    // Use the mutation to update settings
    updateSettingsMutation.mutate(apiData, {
      onSuccess: () => {
        toast.success("General settings updated successfully");
      },
      onError: (error) => {
        toast.error("Error updating general settings");
      },
    });
  };

  // Week schedule submission handler
  const onSubmitWeekSchedule = (data) => {
    // Transform form data to match the calendar time API structure
    const overrides = data.workShifts.map((shift) => {
      const override = {
        date: shift.date,
        isWorking: shift.isOpen,
      };

      // Only include startTime and endTime if isWorking is true
      if (shift.isOpen) {
        override.startTime = shift.open;
        override.endTime = shift.close;
      }

      return override;
    });

    const calendarTimeData = {
      overrides: overrides,
    };

    // Use the calendar time mutation
    updateCalendarTimeMutation.mutate(calendarTimeData, {
      onSuccess: () => {
        toast.success("Week schedule updated successfully");
        refetchWeekTimings();
      },
      onError: (error) => {
        toast.error("Error updating week schedule");
      },
    });
  };

  // Copy handler: store current workShifts in ref
  const handleCopyWeek = () => {
    const currentWorkShifts = watch("workShifts");
    // Deep copy to avoid mutation
    copiedShiftsRef.current = JSON.parse(JSON.stringify(currentWorkShifts));
    toast.success("Week timings copied!");
  };

  // Paste handler: set form's workShifts to copied value
  const handlePasteWeek = () => {
    if (copiedShiftsRef.current) {
      // Remove date/isCustomOverride if present, so it doesn't mismatch with new week
      const pasted = copiedShiftsRef.current.map(({ day, open, close, isOpen }) => ({
        day, open, close, isOpen
      }));
      setValue("workShifts", pasted);
      toast.success("Week timings pasted!");
    } else {
      toast.error("No timings copied yet!");
    }
  };

  // if (weekTimingsLoading || !weekTimings) {
  //   return <SimpleLogoLoader />;
  // }

  return (
    <div className="w-full mx-auto bg-background p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button type="button" className="mr-2 sm:mr-4">
          <ChevronLeft size={20} className="sm:w-6 sm:h-6 text-gray-700" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-1 text-center">Calendar &amp; Booking</h1>
      </div>

      {/* General Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">General</h2>

        {/* Time zone */}
        <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <span className="text-gray-700 text-sm sm:text-base">Time zone</span>
          <div className="relative inline-block">
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-24 cursor-pointer focus:outline-none appearance-none bg-white border border-gray-200 rounded-md px-3 sm:px-4 py-2 pr-8 text-gray-700 text-sm sm:text-base"
                >
                  <option>GMT +1</option>
                  <option>GMT +2</option>
                  <option>GMT +3</option>
                  <option>GMT +4</option>
                  <option>GMT +5</option>
                  <option>GMT +6</option>
                  <option>GMT +7</option>
                  <option>GMT +8</option>
                </select>
              )}
            />
            <ChevronRight size={16} className="absolute right-2 top-2.5 sm:top-3 text-gray-500 transform rotate-90" />
          </div>
        </div>

        {/* Appointment slot size */}
        <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <span className="text-gray-700 text-sm sm:text-base">Appointment slot size</span>
          <div className="relative inline-block">
            <Controller
              name="appointmentSlotSize"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-32 cursor-pointer focus:outline-none appearance-none bg-white border border-gray-200 rounded-md px-3 sm:px-4 py-2 pr-8 text-gray-700 text-sm sm:text-base"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              )}
            />
            <ChevronRight size={16} className="absolute right-2 top-2.5 sm:top-3 text-gray-500 transform rotate-90" />
          </div>
        </div>

        {/* Allow booking outside work shifts */}
        <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <span
            className={`${
              watchedValues.allowOutsideBooking ? "text-gray-700" : "text-gray-400"
            } text-sm sm:text-base flex-1 pr-4`}
          >
            Allow booking outside work shifts
          </span>
          <Controller
            name="allowOutsideBooking"
            control={control}
            render={({ field }) => (
              <div
                className={`w-12 h-6 rounded-full p-1 cursor-pointer flex-shrink-0 ${
                  field.value ? "bg-primary" : "bg-gray-300"
                }`}
                onClick={() => field.onChange(!field.value)}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    field.value ? "translate-x-6" : ""
                  }`}
                />
              </div>
            )}
          />
        </div>

        {/* Google Calendar synchronisation */}
        <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <span
            className={`${
              watchedValues.googleSync ? "text-gray-700" : "text-gray-400"
            } text-sm sm:text-base flex-1 pr-4`}
          >
            Google Calendar synchronisation
          </span>
          <Controller
            name="googleSync"
            control={control}
            render={({ field }) => (
              <div
                className={`w-12 h-6 rounded-full p-1 cursor-pointer flex-shrink-0 ${
                  field.value ? "bg-primary" : "bg-gray-300"
                }`}
                onClick={() => field.onChange(!field.value)}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    field.value ? "translate-x-6" : ""
                  }`}
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* Booking Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Booking</h2>

        {/* Allow clients to book in calendar directly */}
        <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <span
            className={`${
              watchedValues.allowDirectBooking ? "text-gray-700" : "text-gray-400"
            } text-sm sm:text-base flex-1 pr-4`}
          >
            Allow clients to book in calendar directly
          </span>
          <Controller
            name="allowDirectBooking"
            control={control}
            render={({ field }) => (
              <div
                className={`w-12 h-6 rounded-full p-1 cursor-pointer flex-shrink-0 ${
                  field.value ? "bg-primary" : "bg-gray-300"
                }`}
                onClick={() => field.onChange(!field.value)}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    field.value ? "translate-x-6" : ""
                  }`}
                />
              </div>
            )}
          />
        </div>

        {/* Minimum gap between bookings */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow-sm gap-3 sm:gap-0">
          <span className="text-gray-700 text-sm sm:text-base">Minimum gap between bookings</span>
          <div className="relative inline-block w-full sm:w-auto">
            <Controller
              name="minimumGapBetweenBookings"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-32 cursor-pointer appearance-none focus:outline-none bg-white border border-gray-200 rounded-md px-3 sm:px-4 py-2 pr-8 text-gray-700 text-sm sm:text-base"
                >
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              )}
            />
            <ChevronRight size={16} className="absolute right-2 top-2.5 sm:top-3 text-gray-500 transform rotate-90" />
          </div>
        </div>

        {/* Automatically accept direct bookings */}
        <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <span
            className={`${
              watchedValues.autoAcceptBookings ? "text-gray-700" : "text-gray-400"
            } text-sm sm:text-base flex-1 pr-4`}
          >
            Automatically accept direct bookings
          </span>
          <Controller
            name="autoAcceptBookings"
            control={control}
            render={({ field }) => (
              <div
                className={`w-12 h-6 rounded-full p-1 cursor-pointer flex-shrink-0 ${
                  field.value ? "bg-primary" : "bg-gray-300"
                }`}
                onClick={() => field.onChange(!field.value)}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    field.value ? "translate-x-6" : ""
                  }`}
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* Work Shifts Section */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Work shifts</h2>

        {/* Week Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={goToPreviousWeek}
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5 text-gray-500" />
            </button>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">Current week</div>
              <div className="font-semibold text-sm sm:text-base text-gray-700">
                {`${format(new Date(currentViewDates.startDate), "d/M")} - ${format(
                  new Date(currentViewDates.endDate),
                  "d/M"
                )}`}
              </div>
            </div>
            <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={goToNextWeek}>
              <ChevronRight size={18} className="sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </div>
          {/* Work Days - Mobile First Design */}
          <div className="space-y-4">
            {workShifts?.map((day, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-base text-gray-800">{day.day}</div>
                    <div
                      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                        day.isOpen ? "bg-primary" : "bg-gray-300"
                      }`}
                      onClick={() => toggleDayActive(index)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          day.isOpen ? "translate-x-6" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {day.isOpen && (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="text-center">
                        <label className="block text-xs text-gray-600 mb-1">Start</label>
                        <input
                          type="time"
                          value={day.open}
                          onChange={(e) => handleTimeChange(index, "open", e.target.value)}
                          className="w-20 text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div className="text-gray-500 font-medium">—</div>
                      <div className="text-center">
                        <label className="block text-xs text-gray-600 mb-1">End</label>
                        <input
                          type="time"
                          value={day.close}
                          onChange={(e) => handleTimeChange(index, "close", e.target.value)}
                          className="w-20 text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {!day.isOpen && <div className="text-center text-gray-500 text-sm py-2">Closed</div>}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex sm:items-center sm:justify-between">
                  {/* Day Label */}
                  <div className="flex-shrink-0 w-24">
                    <div className="font-semibold text-base text-gray-800">{day.day}</div>
                  </div>

                  {/* Time Controls */}
                  <div className="flex-1 flex items-center justify-center space-x-4">
                    {day.isOpen ? (
                      <>
                        <div className="text-center">
                          <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={day.open}
                            onChange={(e) => handleTimeChange(index, "open", e.target.value)}
                            className="w-32 text-sm border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div className="text-gray-500 font-medium text-lg">—</div>
                        <div className="text-center">
                          <label className="block text-xs text-gray-600 mb-1">End Time</label>
                          <input
                            type="time"
                            value={day.close}
                            onChange={(e) => handleTimeChange(index, "close", e.target.value)}
                            className="w-32 text-sm border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 font-medium">Closed</div>
                    )}
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex-shrink-0 ml-4">
                    <div
                      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                        day.isOpen ? "bg-primary" : "bg-gray-300"
                      }`}
                      onClick={() => toggleDayActive(index)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          day.isOpen ? "translate-x-6" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Icons */}
          <div className="flex justify-center space-x-4 mt-8 mb-4">
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 rounded-full p-3 transition-colors"
              onClick={handleCopyWeek}
            >
              <ClipboardList size={18} className="sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 rounded-full p-3 transition-colors"
              onClick={handlePasteWeek}
            >
              <ClipboardCheck size={18} className="sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>

          {/* Week Schedule Save Button */}
          <div className="flex justify-center sm:justify-end mb-4">
            <button
              type="button"
              onClick={handleSubmit(onSubmitWeekSchedule)}
              disabled={updateCalendarTimeMutation.isPending}
              className={`w-full sm:w-auto cursor-pointer py-2 px-4 text-white font-medium bg-primary rounded-full hover:bg-primary-hover duration-300 transition-all mr-0 sm:mr-3 ${
                updateCalendarTimeMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {updateCalendarTimeMutation.isPending ? "Saving Week..." : "Save Week Schedule"}
            </button>
          </div>
        </div>

        {/* Standard Shift Selection */}
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
          <div className="mb-6 text-center">
            <h3 className="text-[#7d4464] text-lg sm:text-xl font-medium">
              Standard shift for: <span className="font-semibold">{watchedValues.standardShiftWeeks} weeks</span>
            </h3>
          </div>

          {/* Slider */}
          <div className="relative my-8 px-2">
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="absolute top-0 h-2 bg-[#7d4464] rounded-full transition-all duration-200"
                style={{ width: `${(watchedValues.standardShiftWeeks / 12) * 100}%` }}
              ></div>
              <div
                className="absolute -translate-x-1/2 -translate-y-1/4 transition-all duration-200"
                style={{
                  left: `${(watchedValues.standardShiftWeeks / 12) * 100}%`,
                  top: "-1px",
                }}
              >
                <div className="w-5 h-5 bg-white border-2 border-[#7d4464] rounded-full shadow-md cursor-pointer"></div>
              </div>
            </div>

            <Controller
              name="standardShiftWeeks"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="range"
                  min="1"
                  max="12"
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  className="absolute top-0 w-full h-2 appearance-none bg-transparent cursor-pointer opacity-0"
                />
              )}
            />

            {/* Week markers */}
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>1 week</span>
              <span>6 weeks</span>
              <span>12 weeks</span>
            </div>
          </div>

          {/* Save Buttons */}
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={handleSubmit(onSubmitGeneralSettings)}
              disabled={updateSettingsMutation.isPending}
              className={`w-full sm:w-auto cursor-pointer py-3 px-6 text-white font-medium bg-primary rounded-full hover:bg-primary-hover duration-300 transition-all ${
                updateSettingsMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </button>         
          </div>
        </div>
      </div>
    </div>
  );
}
