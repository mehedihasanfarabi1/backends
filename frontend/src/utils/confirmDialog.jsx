import Swal from "sweetalert2";

/**
 * Show a confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} text - Dialog text
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @returns {Promise<boolean>} - true if confirmed, false if canceled
 */
export const confirmDialog = async (
  title = "Are you sure?",
  text = "You won't be able to revert this!",
  confirmText = "Yes",
  cancelText = "Cancel"
) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });

  return result.isConfirmed;
};

/**
 * Show a success message
 */
export const successDialog = (title = "Success!", text = "Operation completed.") => {
  return Swal.fire({
    title,
    text,
    icon: "success",
    confirmButtonColor: "#3085d6",
  });
};

/**
 * Show an error message
 */
export const errorDialog = (title = "Error!", text = "Something went wrong.") => {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonColor: "#d33",
  });
};
