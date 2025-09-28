// utils/formatter.js
export const formatValue = (val) => {
  if (val === null || val === undefined) return "";

  if (typeof val === "object") {
    // যদি Array হয় → join করে দেখাবে
    if (Array.isArray(val)) {
      return val.map((v) => formatValue(v)).join(", ");
    }

    // Priority based readable fields
    const preferredKeys = ["name", "sr_no", "title", "code", "label", "number", "id"];

    for (let key of preferredKeys) {
      if (val[key]) return val[key];
    }

    // Nested object হলে recursive call
    if (val.toString && val.toString !== Object.prototype.toString) {
      return val.toString();
    }

    return JSON.stringify(val); // fallback
  }

  // Date হলে nicely format করবো
  if (val instanceof Date) {
    return val.toLocaleDateString();
  }

  // অন্য সবকিছু 
  return val;
};
