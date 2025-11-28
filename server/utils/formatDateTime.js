// Format date to "Month Day, Year" (e.g., "November 28, 2025")
const formatDate = (date) => {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
}

// Format date to short format (e.g., "Nov 28, 2025")
const formatDateShort = (date) => {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
}

// Format to relative time (e.g., "2 hours ago", "3 days ago")
const formatRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };

    for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }

    return 'just now';
}

// Format date and time (e.g., "November 28, 2025 at 10:30 AM")
const formatDateTime = (date) => {
    const d = new Date(date);
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

    const datePart = d.toLocaleDateString('en-US', dateOptions);
    const timePart = d.toLocaleTimeString('en-US', timeOptions);

    return `${datePart} at ${timePart}`;
}

// Format to ISO string (for API responses)
const formatISO = (date) => {
    return new Date(date).toISOString();
}

export {
    formatDate,
    formatDateShort,
    formatRelativeTime,
    formatDateTime,
    formatISO
};