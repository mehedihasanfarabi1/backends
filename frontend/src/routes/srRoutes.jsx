import React from "react";

import SRList from "../modules/sr/SR/List";
import SRForm from "../modules/sr/SR/Form";
import SREditForm from "../modules/sr/SR/Edit";

export const sr_routes = [

  // SR
  { path: "sr", element: <SRList /> },
  { path: "sr/new", element: <SRForm /> },
  { path: "sr/:id", element: <SREditForm /> },

];
