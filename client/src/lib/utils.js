import { format, isToday, isYesterday, isThisWeek } from "date-fns";

export const getMessageDateLabel = (date) => {
    const msgDate = new Date(date);
    if (isToday(msgDate)) return "Today";
    if (isYesterday(msgDate)) return "Yesterday";
    if (isThisWeek(msgDate)) return format(msgDate, "EEEE"); // Monday, Tuesday
    return format(msgDate, "dd-MM-yyyy"); // Older
};

// You can export other functions or variables as named exports as well:
// export const anotherFunction = () => { ... };