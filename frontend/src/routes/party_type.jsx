import React from "react";

import PartyTypeList from "../modules/party_type/PartyType/List";
import PartyTypeForm from "../modules/party_type/PartyType/Form";
import PartyTypeEditForm from "../modules/party_type/PartyType/Edit";
import PartyList from "../modules/party_type/Party/List";
import PartyForm from "../modules/party_type/Party/Form";


export const party_type = [
  // PartyType
  { path: "party-types", element: <PartyTypeList /> },
  { path: "party-types/new", element: <PartyTypeForm /> },
  { path: "party-types/:id", element: <PartyTypeEditForm /> },

  // Party
  { path: "party-list", element: <PartyList /> },
  { path: "parties/new", element: <PartyForm /> },
  { path: "parties/:id", element: <PartyTypeEditForm /> },

];
