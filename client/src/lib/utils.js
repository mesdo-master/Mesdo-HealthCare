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
        if (isToday(msgDate)) return "Today";
        if (isYesterday(msgDate)) return "Yesterday";
        if (isThisWeek(msgDate)) return format(msgDate, "EEEE"); // Monday, Tuesday
        return format(msgDate, "dd-MM-yyyy"); // Older
    } catch (error) {
        console.error("Error formatting date:", error, "Original date:", date);
        return "Unknown";
    }
};

// You can export other functions or variables as named exports as well:
// export const anotherFunction = () => { ... };