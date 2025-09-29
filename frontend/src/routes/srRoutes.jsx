import React from "react";
import { generateCrudRoutes } from "../utils/routeGenerator";

// SR
import SRList from "../modules/sr/SR/List";
import SRForm from "../modules/sr/SR/Form";
import SREditForm from "../modules/sr/SR/Edit";

export const sr_routes = [
  ...generateCrudRoutes("sr", {
    List: SRList,
    Create: SRForm,
    Edit: SREditForm,
  }, {
    listPerm: "sr_view",
    createPerm: "sr_create",
    editPerm: "sr_edit"
  }),
];
