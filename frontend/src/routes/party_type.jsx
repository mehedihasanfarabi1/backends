import React from "react";
import { generateCrudRoutes } from "../utils/routeGenerator";

// PartyType
import PartyTypeList from "../modules/party_type/PartyType/List";
import PartyTypeForm from "../modules/party_type/PartyType/Form";
import PartyTypeEditForm from "../modules/party_type/PartyType/Edit";

// Party
import PartyList from "../modules/party_type/Party/List";
import PartyForm from "../modules/party_type/Party/Form";
import PartyEditForm from "../modules/party_type/Party/Edit";

// Party Commission
import PartyCommissionList from "../modules/party_type/PartyCommission/List";
import PartyCommissionCreate from "../modules/party_type/PartyCommission/Form";
import PartyCommissionEdit from "../modules/party_type/PartyCommission/Edit";

export const party_type = [
  // PartyType
  ...generateCrudRoutes("party-types", {
    List: PartyTypeList,
    Create: PartyTypeForm,
    Edit: PartyTypeEditForm,
  }, {
    listPerm: "party_type_view",
    createPerm: "party_type_create",
    editPerm: "party_type_edit"
  }),

  // Party
  ...generateCrudRoutes("party-list", {
    List: PartyList,
    Create: PartyForm,
    Edit: PartyEditForm,
  }, {
    listPerm: "party_view",
    createPerm: "party_create",
    editPerm: "party_edit"
  }),

  // Party Commission
  ...generateCrudRoutes("party-commissions", {
    List: PartyCommissionList,
    Create: PartyCommissionCreate,
    Edit: PartyCommissionEdit,
  }, {
    listPerm: "party_commission_view",
    createPerm: "party_commission_create",
    editPerm: "party_commission_edit"
  }),
];
