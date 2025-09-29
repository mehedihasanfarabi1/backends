import React from "react";
import { generateCrudRoutes } from "../utils/routeGenerator";

// Loan Type
import LoanTypeList from "../modules/loan/loanType/List";
import LoanTypeCreate from "../modules/loan/loanType/Form";
import LoanTypeEdit from "../modules/loan/loanType/Edit";

export const loan_routes = [
  ...generateCrudRoutes("loan-types", {
    List: LoanTypeList,
    Create: LoanTypeCreate,
    Edit: LoanTypeEdit,
  }, {
    listPerm: "loan_type_view",
    createPerm: "loan_type_create",
    editPerm: "loan_type_edit"
  }),
];
