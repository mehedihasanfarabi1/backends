import React from "react";
import { generateCrudRoutes } from "../utils/routeGenerator";

// Bag Type

import BagTypeList from "../modules/essential_settings/bagType/List";
import BagTypeCreate from "../modules/essential_settings/bagType/Form";
import BagTypeEdit from "../modules/essential_settings/bagType/Edit";
import AccountHeadList from "../modules/accounts/AccountHead/List";


export const accounts_routes = [
  ...generateCrudRoutes("account-head", {
    List: AccountHeadList,
    Create: BagTypeCreate,
    Edit: BagTypeEdit,
  }, {
    listPerm: "account_head_view",
    createPerm: "bag_type_create",
    editPerm: "bag_type_edit"
  }),
];
