import React from "react";
import { generateCrudRoutes } from "../utils/routeGenerator";

// Bag Type

import BagTypeList from "../modules/essential_settings/bagType/List";
import BagTypeCreate from "../modules/essential_settings/bagType/Form";
import BagTypeEdit from "../modules/essential_settings/bagType/Edit";


export const essential_settings = [
  ...generateCrudRoutes("bag-types", {
    List: BagTypeList,
    Create: BagTypeCreate,
    Edit: BagTypeEdit,
  }, {
    listPerm: "bag_type_view",
    createPerm: "bag_type_create",
    editPerm: "bag_type_edit"
  }),
];
