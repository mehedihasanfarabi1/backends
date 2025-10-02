// 👉 Configurable preferred keys for objects
const DEFAULT_PREFERRED_KEYS = [
    "id","name", "title", "label", "code", "sr_no", "number", "size_name", "unit_name", "short_name"
];


// 👉 Special handlers (per object type / property)
const specialObjectHandlers = {
    unit: (obj) => {
        if (obj.unit_name) {
            return `${obj.unit_name}${obj.short_name ? ` (${obj.short_name})` : ""}`;
        }
        return null;
    },
    size: (obj) => {
        if (obj.size_name) return obj.size_name;
        return null;
    },
    user: (obj) => {
        if (obj.first_name || obj.last_name) {
            return `${obj.first_name || ""} ${obj.last_name || ""}`.trim();
        }
        return null;
    },
    company: (obj) => {
        if (obj.name) return obj.name;
        return null;
    },
};


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
export const formatValue = (val, preferredKeys = DEFAULT_PREFERRED_KEYS) => {
    if (val === null || val === undefined) return "";

    // Number but not boolean
    if (typeof val === "number") {
        return formatNumber(val);
    }

    // Boolean
    if (typeof val === "boolean" || val === "true" || val === "false") {
        return formatBoolean(val);
    }

    // Date / ISO String
    if (val instanceof Date) {
        return formatDateTime(val);
    }
    if (typeof val === "string") {
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
        return val.map((v) => formatValue(v, preferredKeys)).join(", ");
    }

    // Object
    if (typeof val === "object") {
        // 1. Special handlers
        for (let key in specialObjectHandlers) {
            const fn = specialObjectHandlers[key];
            const result = fn(val);
            if (result) return result;
        }

        // 2. Preferred keys (configurable)
        for (let key of preferredKeys) {
            if (val[key]) return formatValue(val[key], preferredKeys);
        }

        // 3. Fallback
        return JSON.stringify(val);
    }

    return String(val);
};
