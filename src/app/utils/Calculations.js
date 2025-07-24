// Format duration from minutes to human-readable format
export const formatDuration = (duration) => {
  if (!duration) return "";
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

// Format price with currency
export const formatPrice = (price) => {
  if (!price) return "";
  return `${price} kr`;
};

// Get color based on booking status
export const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase() || "pending";
  switch (statusLower) {
    case "pending":
      return "#F59E0B"; // Amber
    case "confirmed":
      return "#10B981"; // Emerald Green
    case "cancelled":
      return "#EF4444"; // Red
    case "completed":
      return "#3B82F6"; // Blue
    default:
      return "#8B5CF6"; // Purple
  }
};

// Convert working hours to FullCalendar business hours format
export const getBusinessHours = (workingHours) => {
  const businessHours = [];
  Object.entries(workingHours).forEach(([day, hours]) => {
    if (hours.active) {
      const dayOfWeek = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      }[day];

      businessHours.push({
        daysOfWeek: [dayOfWeek],
        startTime: hours.start,
        endTime: hours.end,
      });
    }
  });
  return businessHours;
};

// Check if a date is in the past
export const isDateInPast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  return selectedDate < today;
};

// Validate time range (end time must be after start time)
export const validateTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return true; // Allow empty values for initial state
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return endTotalMinutes > startTotalMinutes;
};

// Get earliest working hour from working hours configuration
export const getEarliestWorkingHour = (workingHours) => {
  const times = Object.values(workingHours)
    .filter((hours) => hours.active)
    .map((hours) => hours.start);
  return times.length ? Math.min(...times.map((time) => parseInt(time.split(":")[0]))) + ":00:00" : "00:00:00";
};

// Get latest working hour from working hours configuration
export const getLatestWorkingHour = (workingHours) => {
  const times = Object.values(workingHours)
    .filter((hours) => hours.active)
    .map((hours) => hours.end);
  return times.length ? Math.max(...times.map((time) => parseInt(time.split(":")[0]))) + ":00:00" : "23:59:59";
};

// Format time to HH:mm format
export const formatTime = (date) => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Helper function to format date string
export const formatDateString = (date) => {
  return date.getFullYear() + '-' + 
         String(date.getMonth() + 1).padStart(2, '0') + '-' + 
         String(date.getDate()).padStart(2, '0');
};

// Calculate current week dates (Monday to Sunday)
export const getCurrentWeekDates = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + daysToMonday);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    startDate: formatDateString(weekStart),
    endDate: formatDateString(weekEnd),
  };
};

// Calculate week dates from a given date
export const getWeekDatesFromDate = (date) => {
  const dayOfWeek = date.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() + daysToMonday);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    startDate: formatDateString(weekStart),
    endDate: formatDateString(weekEnd),
  };
};

// Calculate week dates from FullCalendar week view
export const getWeekDatesFromCalendarView = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setDate(endDate.getDate() - 1); // FullCalendar's end is exclusive
  
  return {
    startDate: formatDateString(startDate),
    endDate: formatDateString(endDate),
  };
};

// Transform API response to working hours format
export const transformScheduleToWorkingHours = (scheduleData) => {
  if (!scheduleData?.data?.schedule) {
    return {
      monday: { start: "09:00", end: "17:00", active: true },
      tuesday: { start: "09:00", end: "17:00", active: true },
      wednesday: { start: "09:00", end: "17:00", active: true },
      thursday: { start: "09:00", end: "17:00", active: true },
      friday: { start: "09:00", end: "17:00", active: true },
      saturday: { start: "09:00", end: "17:00", active: false },
      sunday: { start: "09:00", end: "17:00", active: false },
    };
  }

  const workingHours = {};
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  
  dayNames.forEach((day) => {
    workingHours[day] = { start: "09:00", end: "17:00", active: false };
  });

  scheduleData.data.schedule.forEach((daySchedule) => {
    const dayName = daySchedule.day.toLowerCase();
    if (workingHours[dayName]) {
      workingHours[dayName] = {
        start: daySchedule.startTime || "09:00",
        end: daySchedule.endTime || "17:00",
        active: daySchedule.isWorking || false,
      };
    }
  });

  return workingHours;
};

// Transform bookings data to calendar events
export const transformBookingsToEvents = (bookingsData) => {
  return bookingsData
    ?.map((booking) => {
      if (!booking.slot?.date || !booking.slot?.startTime || !booking.slot?.endTime) {
        return null;
      }

      return {
        id: booking._id,
        title: booking.customer?.name || "Unknown Customer",
        start: `${booking.slot.date}T${booking.slot.startTime}:00`,
        end: `${booking.slot.date}T${booking.slot.endTime}:00`,
        backgroundColor: getStatusColor(booking.status),
        borderColor: getStatusColor(booking.status),
        textColor: "#FFFFFF",
        display: "block",
        extendedProps: {
          customer: booking.customer || {},
          service: booking.service || {},
          status: booking.status || "pending",
          paymentStatus: booking.paymentStatus || "pending",
          amount: booking.amount || 0,
          paymentMethod: booking.paymentMethod || "cash",
          isManual: booking.isManual || false,
          isArchived: booking.isArchived || false,
        },
      };
    })
    .filter(Boolean) || [];
};

// Calculate new dates based on calendar view type
export const calculateNewDatesFromView = (dateInfo) => {
  const { start, end, view } = dateInfo;
  let newDates;

  if (view.type === "timeGridWeek") {
    newDates = getWeekDatesFromCalendarView(start, end);
  } else if (view.type === "timeGridDay") {
    newDates = getWeekDatesFromDate(start);
  } else {
    newDates = getCurrentWeekDates();
  }

  return newDates;
};
