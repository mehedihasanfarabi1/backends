
import React from "react";
import LoanTypeList from "../modules/loan/loanType/List";
import LoanTypeCreate from "../modules/loan/loanType/Form";
import LoanTypeEdit from "../modules/loan/loanType/Edit";

export const loan_routes = [

    // Loan Type
    { path: "loan-types", element: <LoanTypeList /> },
    { path: "loan-types/new", element: <LoanTypeCreate /> },
    { path: "loan-types/:id", element: <LoanTypeEdit /> },

]