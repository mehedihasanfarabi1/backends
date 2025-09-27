import React from "react";



import PallotTypeList from "../modules/pallot/PallotType/List";
import PallotTypeForm from "../modules/pallot/PallotType/Form";

import PallotLocationList from "../modules/pallot/PallotLocation/List";

import ChamberForm from "../modules/pallot/PallotLocation/Chamber/ChamberForm";
import ChamberEditForm from "../modules/pallot/PallotLocation/Chamber/ChemberFormEdit";

import FloorForm from "../modules/pallot/PallotLocation/Floor/FloorForm";


import PocketForm from "../modules/pallot/PallotLocation/PocketForm";
import FloorEditForm from "../modules/pallot/PallotLocation/Floor/FloorEdit";


export const pallet_routes = [

  // Pallet
  { path: "pallet", element: <PallotTypeList /> },
  { path: "pallet/new", element: <PallotTypeForm /> },
  { path: "pallet/:id", element: <PallotTypeForm /> },

  // Pallot Location
  { path: "pallet_location", element: <PallotLocationList /> },

  { path: "pallet_location/chamber/create", element: <ChamberForm /> },
  { path: "pallet_location/chamber/:id", element: <ChamberEditForm /> },


  { path: "pallet_location/floor/create", element: <FloorForm /> },
  { path: "pallet_location/floor/:id", element: <FloorEditForm /> },


  { path: "pallet_location/pocket/create", element: <PocketForm /> },
  // { path: "pallet_location/:id", element: <PallotTypeForm /> },

];
