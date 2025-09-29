import React from "react";
import { generateCrudRoutes } from "../utils/routeGenerator";

// Booking
import BookingList from "../modules/booking/bookingList/List";
import BookingForm from "../modules/booking/bookingList/Form";
import BookingEditForm from "../modules/booking/bookingList/Form";

export const booking_routes = [
  ...generateCrudRoutes("bookings", { List: BookingList, Create: BookingForm, Edit: BookingEditForm }, {
    listPerm: "booking_view",
    createPerm: "booking_create",
    editPerm: "booking_edit"
  }),
];
