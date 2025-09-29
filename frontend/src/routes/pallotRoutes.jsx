import React from "react";
import { generateCrudRoutes } from "../utils/routeGenerator";
import ProtectedRoute from "../contexts/ProtectedRoute";
// Pallot Type
import PallotTypeList from "../modules/pallot/PallotType/List";
import PallotTypeForm from "../modules/pallot/PallotType/Form";

// Pallot Location
import PallotLocationList from "../modules/pallot/PallotLocation/List";
import ChamberForm from "../modules/pallot/PallotLocation/Chamber/ChamberForm";
import ChamberEditForm from "../modules/pallot/PallotLocation/Chamber/ChemberFormEdit";
import FloorForm from "../modules/pallot/PallotLocation/Floor/FloorForm";
import FloorEditForm from "../modules/pallot/PallotLocation/Floor/FloorEdit";
import PocketForm from "../modules/pallot/PallotLocation/PocketForm";

// Pallot
import PallotList from "../modules/pallot/Pallot/List";
import CreatePallotForm from "../modules/pallot/Pallot/Form";
import PallotEditForm from "../modules/pallot/Pallot/Edit";

export const pallet_routes = [
  // Pallot Type
  ...generateCrudRoutes("pallet", {
    List: PallotTypeList,
    Create: PallotTypeForm,
    Edit: PallotTypeForm,
  }, {
    listPerm: "pallot_type_view",
    createPerm: "pallot_type_create",
    editPerm: "pallot_type_edit"
  }),

  // Pallot Location (manual routes, separate forms)
  { path: "pallet_location", element: <PallotLocationList /> },

  // Chamber
  { path: "pallet_location/chamber/create", element: <ProtectedRoute>{<ChamberForm />}</ProtectedRoute> },
  { path: "pallet_location/chamber/:id", element: <ProtectedRoute>{<ChamberEditForm />}</ProtectedRoute> },

  // Floor
  { path: "pallet_location/floor/create", element: <ProtectedRoute>{<FloorForm />}</ProtectedRoute> },
  { path: "pallet_location/floor/:id", element: <ProtectedRoute>{<FloorEditForm />}</ProtectedRoute> },

  // Pocket
  { path: "pallet_location/pocket/create", element: <ProtectedRoute>{<PocketForm />}</ProtectedRoute> },

  // Pallot CRUD
  ...generateCrudRoutes("pallet_list", {
    List: PallotList,
    Create: CreatePallotForm,
    Edit: PallotEditForm,
  }, {
    listPerm: "pallot_view",
    createPerm: "pallot_create",
    editPerm: "pallot_edit"
  }),
];
