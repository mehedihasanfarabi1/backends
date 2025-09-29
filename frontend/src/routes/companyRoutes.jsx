import React from "react";
import { generateCrudRoutes } from "../utils/routeGenerator";

// Company
import CompanyList from "../modules/company/companyInfo/CompanyList";
import CompanyForm from "../modules/company/companyInfo/CompanyForm";

// Business Type
import BusinessTypeList from "../modules/company/businessType/BusinessTypeList";
import BusinessTypeForm from "../modules/company/businessType/BusinessTypeForm";

// Factory
import FactoryList from "../modules/company/factory/FactoryList";
import FactoryForm from "../modules/company/factory/FactoryForm";

export const companyRoutes = [
  // Companies
  ...generateCrudRoutes("companies", { List: CompanyList, Create: CompanyForm, Edit: CompanyForm }, {
    listPerm: "company_view",
    createPerm: "company_create",
    editPerm: "company_edit"
  }),

  // Business Types
  ...generateCrudRoutes("business-types", { List: BusinessTypeList, Create: BusinessTypeForm, Edit: BusinessTypeForm }, {
    listPerm: "business_type_view",
    createPerm: "business_type_create",
    editPerm: "business_type_edit"
  }),

  // Factories
  ...generateCrudRoutes("factories", { List: FactoryList, Create: FactoryForm, Edit: FactoryForm }, {
    listPerm: "factory_view",
    createPerm: "factory_create",
    editPerm: "factory_edit"
  }),
];
