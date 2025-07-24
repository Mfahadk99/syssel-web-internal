import React, { useState, useEffect } from "react";
import { MapPin, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetSettingsById,
  useUpdateSettings,
  useGetWeekTimingsBySettingId,
  useUpdateCalendarTime,
} from "@/app/hooks/useSettings";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/app/store/useAuthStore";

// integrate profile update api to update timings

export default function ProviderInfoSection({ userType, providerData }) {
  const { currentProfile } = useAuthStore();
  const settingId = currentProfile?.settingId;

  const getCurrentWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = new Date(now);
    start.setDate(now.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const format = (date) => date.toISOString().split("T")[0];
    return {
      startDate: format(start),
      endDate: format(end),
    };
  };

  const { startDate, endDate } = getCurrentWeekRange();

  // Get schedule data for the week
  const { data: scheduledata, isLoading: isScheduleLoading } =
    useGetWeekTimingsBySettingId(settingId, startDate, endDate);

  // Get and update location only
  const { data: settingsData } = useGetSettingsById(providerData.id);
  const updateLocation = useUpdateSettings(settingsData?.data?._id);

  // Update calendar time for schedule
  const updateCalendarTime = useUpdateCalendarTime(settingId);

  const [isEditing, setIsEditing] = useState(false);
  const [location, setLocation] = useState("");
  const [schedule, setSchedule] = useState([]);
  const queryClient = useQueryClient();

  // Sync location from settingsData
  useEffect(() => {
    if (settingsData?.data) {
      setLocation(settingsData.data.location?.address || "");
    }
  }, [settingsData]);

  // Sync schedule from scheduledata
  useEffect(() => {
    if (scheduledata?.data?.schedule) {
      setSchedule(
        scheduledata.data.schedule.map((item) => ({
          ...item,
          open: item.startTime || "",
          close: item.endTime || "",
          isOpen: item.isWorking,
        }))
      );
    }
  }, [scheduledata]);

  // Handle time change for a day
  const handleTimeChange = (index, field, value) => {
    const updatedSchedule = [...schedule];
    if (field === "open") updatedSchedule[index].open = value;
    if (field === "close") updatedSchedule[index].close = value;
    setSchedule(updatedSchedule);
  };

  // Toggle open/close for a day
  const handleToggleDay = (index) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index].isOpen = !updatedSchedule[index].isOpen;
    setSchedule(updatedSchedule);
  };

  // Save handler: update schedule and location separately
  const handleSave = async () => {
    setIsEditing(false);
    let scheduleError = null;
    let locationError = null;
    // Prepare overrides for schedule update
    const overrides = schedule.map((item) => {
      const base = {
        date: item.date,
        isWorking: item.isOpen,
      };
      if (item.isOpen) {
        base.startTime = item.open;
        base.endTime = item.close;
      }
      return base;
    });
    try {
      // Update schedule
      await updateCalendarTime.mutateAsync({ overrides });
      queryClient.invalidateQueries({
        queryKey: ["SETTINGS", "week-schedule", settingId, startDate, endDate],
      });
    } catch (error) {
      scheduleError = error;
    }
    try {
      // Update location if changed
      if (location !== (settingsData?.data?.location?.address || "")) {
        await updateLocation.mutateAsync({ location: { address: location } });
        queryClient.invalidateQueries({
          queryKey: ["SETTINGS", "profile", providerData.id],
        });
      }
    } catch (error) {
      locationError = error;
    }
    if (!scheduleError && !locationError) {
      toast.success("Profile updated successfully!");
    } else {
      if (scheduleError)
        toast.error("Failed to update schedule: " + scheduleError.message);
      if (locationError)
        toast.error("Failed to update location: " + locationError.message);
    }
  };

  return (
    <div className="w-[95%] mx-auto bg-white rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-medium">Opening Times</h2>
        {userType !== "buyer" &&
          (isEditing ? (
            <button
              onClick={handleSave}
              className="text-[var(--color-primary)] font-medium"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[var(--color-secondary)] font-medium"
            >
              Edit
            </button>
          ))}
      </div>

      {/* Schedule Display */}
      {!isEditing ? (
        <div className="divide-y">
          {schedule.map((item, index) => (
            <div
              key={item.date}
              className={`flex justify-between items-center p-4`}
            >
              <span className="font-medium text-[var(--color-secondary)]">
                {item.day.charAt(0).toUpperCase() + item.day.slice(1)}
              </span>
              <span className="text-[var(--color-secondary)]">
                {item.isOpen ? `${item.open} - ${item.close}` : "Closed"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y">
          {schedule.map((item, index) => (
            <div
              key={item.date}
              className={`flex justify-between items-center p-4 ${
                !item.isOpen ? "bg-[var(--color-secondary)]/5" : ""
              }`}
            >
              <div className="flex items-center">
                <button
                  className={`w-6 h-6 rounded-full mr-2 ${
                    item.isOpen
                      ? "bg-[var(--color-primary)]"
                      : "border border-[var(--color-secondary)]"
                  }`}
                  onClick={() => handleToggleDay(index)}
                >
                  {item.isOpen && (
                    <div className="w-2 h-2 bg-white rounded-full m-auto"></div>
                  )}
                </button>
                <span className="font-medium text-[var(--color-secondary)]">
                  {item.day.charAt(0).toUpperCase() + item.day.slice(1)}
                </span>
              </div>
              {item.isOpen ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={item.open}
                    onChange={(e) =>
                      handleTimeChange(index, "open", e.target.value)
                    }
                    className="border rounded-full px-3 py-1 text-center text-[var(--color-secondary)]"
                  />
                  <span className="text-[var(--color-secondary)]">-</span>
                  <input
                    type="time"
                    value={item.close}
                    onChange={(e) =>
                      handleTimeChange(index, "close", e.target.value)
                    }
                    className="border rounded-full px-3 py-1 text-center text-[var(--color-secondary)]"
                  />
                </div>
              ) : (
                <span className="text-[var(--color-secondary)]">Closed</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Location Section */}
      <div className="p-4 border-t">
        <h2 className="text-xl font-medium mb-3">Location</h2>
        {isEditing ? (
          <input
            type="text"
            value={location}
            maxLength={50}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border p-2 rounded mb-4 text-[var(--color-secondary)]"
          />
        ) : (
          <p className="text-[var(--color-secondary)] mb-4">{location}</p>
        )}
        {/* Map Preview */}
        <div className="relative rounded-lg overflow-hidden bg-[var(--color-secondary)]/10 h-48">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
              <MapPin size={20} color="white" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 bg-[var(--color-primary)] text-white px-3 py-1 rounded-full text-sm flex items-center">
            <span>500m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
