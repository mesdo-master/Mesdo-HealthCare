import { format, isToday, isYesterday, isThisWeek } from "date-fns";

export const getMessageDateLabel = (date) => {
  // Handle null, undefined, or invalid dates
  if (!date) {
    console.warn("Invalid date provided to getMessageDateLabel:", date);
    return "Unknown";
  }

  const msgDate = new Date(date);

  // Check if the date is valid
  if (isNaN(msgDate.getTime())) {
    console.warn("Invalid date value provided to getMessageDateLabel:", date);
    return "Unknown";
  }

  try {
    const monthDay = format(msgDate, "MMMM d"); // "August 3"

    if (isToday(msgDate)) return `Today, ${monthDay}`;
    if (isYesterday(msgDate)) return `Yesterday, ${monthDay}`;
    if (isThisWeek(msgDate)) return format(msgDate, "EEEE, MMMM d"); // "Monday, August 3"
    return format(msgDate, "MMMM d, yyyy"); // "August 3, 2024" for older dates
  } catch (error) {
    console.error("Error formatting date:", error, "Original date:", date);
    return "Unknown";
  }
};

// You can export other functions or variables as named exports as well:
// export const anotherFunction = () => { ... };
