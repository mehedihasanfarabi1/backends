import React from "react";
import BookingList from "../modules/booking/bookingList/List";
import BookingForm from "../modules/booking/bookingList/Form";
import BookingEditForm from "../modules/booking/bookingList/Form";

export const booking_routes = [

  // Booking
  { path: "bookings", element: <BookingList /> },
  { path: "booking/new", element: <BookingForm /> },
  { path: "booking/:id", element: <BookingEditForm /> },

];
