export function formatTime(dateString, formatOptions = {}) {
    if (!dateString) return "";

    const defaultOptions = {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Merge user-defined options with defaults
    const options = Object.keys(formatOptions).length === 0 ? defaultOptions : formatOptions;

    // Handle invalid dates
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return new Intl.DateTimeFormat(
        localStorage.getItem("selectedLanguage") || navigator.language || "uk-UA",
        options
    ).format(date);
}

export function formatLastSeen(lastSeen) {
    const lastSeenDate = new Date(lastSeen);
    const today = new Date();

    // Check if `lastSeen` is today
    const isToday =
        lastSeenDate.getDate() === today.getDate() &&
        lastSeenDate.getMonth() === today.getMonth() &&
        lastSeenDate.getFullYear() === today.getFullYear();

    if (isToday) {
        // Show only time
        return formatTime(lastSeen, { hour: "2-digit", minute: "2-digit" });
    }

    // Check if `lastSeen` is in the current year
    const isCurrentYear = lastSeenDate.getFullYear() === today.getFullYear();

    if (isCurrentYear) {
        // Show date without year, and time
        return formatTime(lastSeen, {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    // Show full date and time with year
    return formatTime(lastSeen, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function isCurrentYear(dateString) {
    const messageDate = new Date(dateString);
    const currentYear = new Date().getFullYear();
    return messageDate.getFullYear() === currentYear;
}