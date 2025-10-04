import React from "react";
import { generateCrudRoutes } from "../utils/routeGenerator";

// Bag Type
import BagTypeList from "../modules/essential_settings/bagType/List";
import BagTypeCreate from "../modules/essential_settings/bagType/Form";
import BagTypeEdit from "../modules/essential_settings/bagType/Edit";


// // Conditions
// import ConditionsList from "../modules/essential_settings/conditions/List";
// import ConditionsCreate from "../modules/essential_settings/conditions/Form";
// import ConditionsEdit from "../modules/essential_settings/conditions/Edit";

// // PC Settings
// import PCSettingsList from "../modules/essential_settings/pcSettings/List";
// import PCSettingsCreate from "../modules/essential_settings/pcSettings/Form";
// import PCSettingsEdit from "../modules/essential_settings/pcSettings/Edit";

// // Shed Settings
// import ShedSettingsList from "../modules/essential_settings/shedSettings/List";
// import ShedSettingsCreate from "../modules/essential_settings/shedSettings/Form";
// import ShedSettingsEdit from "../modules/essential_settings/shedSettings/Edit";

// // General Settings
// import GeneralSettingsList from "../modules/essential_settings/generalSettings/List";
// import GeneralSettingsCreate from "../modules/essential_settings/generalSettings/Form";
// import GeneralSettingsEdit from "../modules/essential_settings/generalSettings/Edit";

// // Basic Settings
// import BasicSettingsList from "../modules/essential_settings/basicSettings/List";
// import BasicSettingsCreate from "../modules/essential_settings/basicSettings/Form";
// import BasicSettingsEdit from "../modules/essential_settings/basicSettings/Edit";

// // Transaction Settings
// import TransactionSettingsList from "../modules/essential_settings/transactionSettings/List";
// import TransactionSettingsCreate from "../modules/essential_settings/transactionSettings/Form";
// import TransactionSettingsEdit from "../modules/essential_settings/transactionSettings/Edit";

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

  // ...generateCrudRoutes("conditions", {
  //   List: ConditionsList,
  //   Create: ConditionsCreate,
  //   Edit: ConditionsEdit,
  // }, {
  //   listPerm: "condition_view",
  //   createPerm: "condition_create",
  //   editPerm: "condition_edit"
  // }),

  // ...generateCrudRoutes("pc-settings", {
  //   List: PCSettingsList,
  //   Create: PCSettingsCreate,
  //   Edit: PCSettingsEdit,
  // }, {
  //   listPerm: "pc_setting_view",
  //   createPerm: "pc_setting_create",
  //   editPerm: "pc_setting_edit"
  // }),

  // ...generateCrudRoutes("shed-settings", {
  //   List: ShedSettingsList,
  //   Create: ShedSettingsCreate,
  //   Edit: ShedSettingsEdit,
  // }, {
  //   listPerm: "shed_setting_view",
  //   createPerm: "shed_setting_create",
  //   editPerm: "shed_setting_edit"
  // }),

  // ...generateCrudRoutes("general-settings", {
  //   List: GeneralSettingsList,
  //   Create: GeneralSettingsCreate,
  //   Edit: GeneralSettingsEdit,
  // }, {
  //   listPerm: "general_setting_view",
  //   createPerm: "general_setting_create",
  //   editPerm: "general_setting_edit"
  // }),

  // ...generateCrudRoutes("basic-settings", {
  //   List: BasicSettingsList,
  //   Create: BasicSettingsCreate,
  //   Edit: BasicSettingsEdit,
  // }, {
  //   listPerm: "basic_setting_view",
  //   createPerm: "basic_setting_create",
  //   editPerm: "basic_setting_edit"
  // }),

  // ...generateCrudRoutes("transaction-settings", {
  //   List: TransactionSettingsList,
  //   Create: TransactionSettingsCreate,
  //   Edit: TransactionSettingsEdit,
  // }, {
  //   listPerm: "transaction_setting_view",
  //   createPerm: "transaction_setting_create",
  //   editPerm: "transaction_setting_edit"
  // }),
];
