import React from "react";
import Dashboard from "../pages/admin/Dashboard";
import Profile from "../pages/admin/Profile";
import DepartmentPage from "../pages/admin/DepartmentDetails";
import HomeSettings from "../pages/admin/HomeSettings";
import PermissionPage from "../pages/admin/Permissions/PermissionPage";
import UsersPage from "../pages/admin/UsersPage";
import CreateUserPage from "../pages/admin/Users/CreateUserPage";
import RolesPage from "../pages/admin/Users/RolesPages";
import PermissionsPage from "../pages/admin/Users/PermissionsPages";
import PermissionDesigner from "../components/common/DraggablePermissionGroup";

import { productRoutes } from "./productRoutes";
import { companyRoutes } from "./companyRoutes";
import { party_type } from "./party_type";
import { booking_routes } from "./bookingRoutes";
import { sr_routes } from "./srRoutes";
import { pallet_routes } from "./pallotRoutes";
import { loan_routes } from "./loanRoutes"; 
import { essential_settings } from "./essentialSettingsRoute";
import { accounts_routes } from "./accountsRoute";
import BookingList from "../modules/booking/bookingList/List";

export const adminRoutes = [
  { index: true, element: <Dashboard /> },
  { path: "profile", element: <Profile /> },
  { path: "department", element: <DepartmentPage /> },
  { path: "home-settings", element: <HomeSettings /> },
  { path: "permissions", element: <PermissionPage /> },
  { path: "users", element: <UsersPage /> },
  { path: "users/create", element: <CreateUserPage /> },
  { path: "users/roles", element: <RolesPage /> },
  { path: "users/permissions", element: <PermissionsPage /> },
  { path: "permission-designer", element: <PermissionDesigner /> },
  { path: "bookings_essential", element: <BookingList /> },



  // Module-wise spread
  ...productRoutes,
  ...companyRoutes,
  ...party_type,
  ...booking_routes,
  ...sr_routes,
  ...pallet_routes,
  ...loan_routes,
  ...essential_settings,
  ...accounts_routes
];
