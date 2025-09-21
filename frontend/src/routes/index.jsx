import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Login from "../components/Login";
import Register from "../components/Register";
import ProtectedRoute from "../contexts/ProtectedRoute";
import { adminRoutes } from "./adminRoutes";
import ErrorPages from "../pages/ErrorPage";

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: adminRoutes.map((route) => ({
      ...route,
      element: <ProtectedRoute>{route.element}</ProtectedRoute>,
    })),
  },

  { path: "*", element: <ErrorPages /> },
]);
