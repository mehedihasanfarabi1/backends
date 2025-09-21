import React from "react";
import CompanyList from "../modules/company/companyInfo/CompanyList";
import CompanyForm from "../modules/company/companyInfo/CompanyForm";
import BusinessTypeList from "../modules/company/businessType/BusinessTypeList";
import BusinessTypeForm from "../modules/company/businessType/BusinessTypeForm";
import FactoryList from "../modules/company/factory/FactoryList";
import FactoryForm from "../modules/company/factory/FactoryForm";

export const companyRoutes = [
  // Company
  { path: "companies", element: <CompanyList /> },
  { path: "companies/new", element: <CompanyForm /> },
  { path: "companies/:id", element: <CompanyForm /> },

  { path: "business-types", element: <BusinessTypeList /> },
  { path: "business-types/new", element: <BusinessTypeForm /> },
  { path: "business-types/:id", element: <BusinessTypeForm /> },

  { path: "factories", element: <FactoryList /> },
  { path: "factories/new", element: <FactoryForm /> },
  { path: "factories/:id", element: <FactoryForm /> },
];
