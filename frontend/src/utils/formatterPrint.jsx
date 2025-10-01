// 👉 Date formatting helper
const formatDate = (date) => {
    try {
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date(date));
    } catch {
        return String(date);
    }
};

// 👉 DateTime formatting helper
const formatDateTime = (date) => {
    try {
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(date));
    } catch {
        return String(date);
    }
};

// 👉 Boolean formatting
const formatBoolean = (val) => {
    if (val === true || val === "true" || val === 1) return "Yes";
    if (val === false || val === "false" || val === 0) return "No";
    return "";
};

// 👉 Number formatting 
const formatNumber = (num) => {
    try {
        return new Intl.NumberFormat("en-IN").format(num);
    } catch {
        return num;
    }
};

// 👉 Main universal formatter
export const formatValue = (val) => {
    if (val === null || val === undefined) return "";

    // Boolean
    if (typeof val === "boolean" || val === 0 || val === 1 || val === "true" || val === "false") {
        return formatBoolean(val);
    }

    // Number
    if (typeof val === "number") {
        return formatNumber(val);
    }

    // Date / ISO String
    if (val instanceof Date) {
        return formatDateTime(val);
    }
    if (typeof val === "string") {
        // ISO date check
        if (/^\d{4}-\d{2}-\d{2}T/.test(val)) {
            return formatDateTime(val);
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            return formatDate(val);
        }
        return val;
    }

    // Array
    if (Array.isArray(val)) {
        return val.map((v) => formatValue(v)).join(", ");
    }

    // Object
    if (typeof val === "object") {
        const preferredKeys = ["name", "sr_no", "title", "code", "label", "number", "id"];

        for (let key of preferredKeys) {
            if (val[key]) return formatValue(val[key]);
        }

        // Nested object হলে recursive
        if (val.toString && val.toString !== Object.prototype.toString) {
            return val.toString();
        }

        return JSON.stringify(val);
    }

    // Default fallback
    return String(val);
};
