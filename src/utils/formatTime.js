import i18n from "@/utils/i18n";

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

export function formatReadAt(dateString) {
    if (!dateString) return "";

    const inputDate = new Date(dateString);
    const today = new Date();

    // Handle invalid dates
    if (isNaN(inputDate.getTime())) return "Invalid date";

    const isToday =
        inputDate.getDate() === today.getDate() &&
        inputDate.getMonth() === today.getMonth() &&
        inputDate.getFullYear() === today.getFullYear();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isYesterday =
        inputDate.getDate() === yesterday.getDate() &&
        inputDate.getMonth() === yesterday.getMonth() &&
        inputDate.getFullYear() === yesterday.getFullYear();

    const time = formatTime(dateString, { hour: "2-digit", minute: "2-digit" });

    if (isToday) {
        return i18n.global.t('chat.contextMenu.readAt.today', {time: time});
    } else if (isYesterday) {
        return i18n.global.t('chat.contextMenu.readAt.yesterday', {time: time});
    } else {
        return formatTime(dateString, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
}

export function isCurrentYear(dateString) {
    const messageDate = new Date(dateString);
    const currentYear = new Date().getFullYear();
    return messageDate.getFullYear() === currentYear;
}