import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";

import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./pages/admin/Profile";
import DepartmentPage from "./pages/admin/DepartmentDetails";
import HomeSettings from "./pages/admin/HomeSettings";
import ProtectedRoute from "./contexts/ProtectedRoute";
import PermissionPage from "./pages/admin/Permissions/PermissionPage";
// import PermissionPage from "./pages/admin/PermissionPages";
import UsersPage from "./pages/admin/UsersPage";
import CreateUserPage from "./pages/admin/Users/CreateUserPage";
import RolesPage from "./pages/admin/Users/RolesPages";
import PermissionsPage from "./pages/admin/Users/PermissionsPages";
import PermissionDesigner from "./components/common/DraggablePermissionGroup";
import PTList from "./modules/products/ProductType/List";
import PTForm from "./modules/products/ProductType/Form";
import CategoryList from "./modules/products/Category/List";
import CategoryForm from "./modules/products/Category/Form";
import ItemList from "./modules/products/Item/List";
import ItemForm from "./modules/products/Item/Form";
import UnitList from "./modules/products/Unit/List";
import UnitForm from "./modules/products/Unit/Form";
import UnitSizeList from "./modules/products/UnitSize/List";
import UnitSizeForm from "./modules/products/UnitSize/Form";
import UnitConversionForm from "./modules/products/UnitConversion/Form";
import UnitConversionList from "./modules/products/UnitConversion/List";

// Company

import CompanyList from "./modules/company/companyInfo/CompanyList";
import CompanyForm from "./modules/company/companyInfo/CompanyForm";
import BusinessTypeList from "./modules/company/businessType/BusinessTypeList";
import BusinessTypeForm from "./modules/company/BusinessType/BusinessTypeForm";
import FactoryList from "./modules/company/factory/FactoryList";
import FactoryForm from "./modules/company/factory/FactoryForm";




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
    children: [
      { index: true, element: <ProtectedRoute><Dashboard /></ProtectedRoute> },

      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "department", element: <ProtectedRoute><DepartmentPage /></ProtectedRoute> },
      { path: "home-settings", element: <ProtectedRoute><HomeSettings /></ProtectedRoute> },
      { path: "permissions", element: <ProtectedRoute><PermissionPage /></ProtectedRoute> },
      { path: "users", element: <ProtectedRoute><UsersPage /></ProtectedRoute> },
      { path: "users/create", element: <ProtectedRoute><CreateUserPage /></ProtectedRoute> },
      { path: "users/roles", element: <ProtectedRoute><RolesPage /></ProtectedRoute> },
      { path: "users/permissions", element: <ProtectedRoute><PermissionsPage /></ProtectedRoute> },
      { path: "permission-designer", element: <ProtectedRoute><PermissionDesigner /></ProtectedRoute> },
      // ✅ ProductType routes
      { path: "product-types", element: <PTList /> },
      { path: "product-types/new", element: <PTForm /> },
      { path: "product-types/:id", element: <PTForm /> },

      // ✅ Category routes
      { path: "categories", element: <CategoryList /> },
      { path: "categories/new", element: <CategoryForm /> },
      { path: "categories/:id", element: <CategoryForm /> },

      // ✅ Product routes
      { path: "products", element: <ItemList /> },
      { path: "products/new", element: <ItemForm /> },
      { path: "products/:id", element: <ItemForm /> },
      // ✅ Product routes
      { path: "units", element: < UnitList /> },
      { path: "units/new", element: <UnitForm /> },
      { path: "units/:id", element: <UnitForm /> },
      // ✅ Product routes
      { path: "unit-sizes", element: < UnitSizeList /> },
      { path: "unit-sizes/new", element: <UnitSizeForm /> },
      { path: "unit-sizes/:id", element: <UnitSizeForm /> },
      // ✅ Product routes
      { path: "unit-sizes", element: < UnitSizeList /> },
      { path: "unit-sizes/new", element: <UnitSizeForm /> },
      { path: "unit-sizes/:id", element: <UnitSizeForm /> },
      // ✅ Product routes
      { path: "unit-conversions", element: < UnitConversionList /> },
      { path: "unit-conversions/new", element: <UnitConversionForm /> },
      { path: "unit-conversions/:id", element: <UnitConversionForm /> },

      // Company 
      // inside children []
      { path: "companies", element: <CompanyList /> },
      { path: "companies/new", element: <CompanyForm /> },
      { path: "companies/:id", element: <CompanyForm /> },

      { path: "business-types", element: <BusinessTypeList /> },
      { path: "business-types/new", element: <BusinessTypeForm /> },
      { path: "business-types/:id", element: <BusinessTypeForm /> },

      { path: "factories", element: <FactoryList /> },
      { path: "factories/new", element: <FactoryForm /> },
      { path: "factories/:id", element: <FactoryForm /> },
      { path: "users/roles", element: <RolesPage /> },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);



















// import { createBrowserRouter, Navigate } from "react-router-dom";
// import AdminLayout from "./components/AdminLayout";
// import Dashboard from "./pages/admin/Dashboard";
// import ProductList from "./pages/admin/ProductList";
// import ProductNew from "./pages/admin/ProductNew";
// import Category from "./pages/admin/Category";
// import Subcategory from "./pages/admin/Subcategory";
// import BrandNew from "./pages/admin/BrandNew";
// import OrderChart from "./pages/admin/OrderChart";
// import PTList from './modules/products/ProductType/List';
// import PTForm from "./modules/products/ProductType/Form";
// import UnitForm from './modules/products/Unit/Form';
// import UnitSizeForm from './modules/products/UnitSize/Form';
// import UnitSizeList from './modules/products/UnitSize/List';


// export const router = createBrowserRouter([
//   { path: "/", element: <Navigate to="/admin" replace /> },
//   {
//     path: "/admin",
//     element: <AdminLayout />,
//     children: [
//       { index: true, element: <Dashboard /> },                 // /admin
//       { path: "products", element: <ProductList /> },         // /admin/products
//       { path: "products/new", element: <ProductNew /> },       // /admin/products/new
//       { path: "categories/new", element: <Category /> },    // /admin/categories/new
//       { path: "subcategories/new", element: <Subcategory /> }, // /admin/subcategories/new
//       { path: "brands/new", element: <BrandNew /> },           // /admin/brands/new
//       { path: "order-chart", element: <OrderChart /> },        // /admin/order-chart
//     ],
//   },
// ]);
