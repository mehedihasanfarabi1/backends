import React from "react";

import PTList from "../modules/products/ProductType/List";
import PTForm from "../modules/products/ProductType/Form";
import ProductTypeEdit from "../modules/products/ProductType/Edit"; // ✅ Alada Edit page

import CategoryList from "../modules/products/Category/List";
import CategoryForm from "../modules/products/Category/Form";
import CategoryEdit from "../modules/products/Category/Edit";

import ProductList from "../modules/products/Product/List";
import ProductForm from "../modules/products/Product/Form";
import ProductEdit from "../modules/products/Product/Edit";

import UnitList from "../modules/products/Unit/List";
import UnitForm from "../modules/products/Unit/Form";


import UnitSizeList from "../modules/products/UnitSize/List";
import UnitSizeForm from "../modules/products/UnitSize/Form";


import UnitConversionList from "../modules/products/UnitConversion/List";
import UnitConversionForm from "../modules/products/UnitConversion/Form";


import ProductSizeSettingList from "../modules/products/ProductSizeSetting/List";
import ProductSizeSettingForm from "../modules/products/ProductSizeSetting/Form";
import UnitEdit from "../modules/products/Unit/Edit";
import UnitSizeEdit from "../modules/products/UnitSize/Edit";
import UnitConversionEdit from "../modules/products/UnitConversion/Edit";


import ListTranslations from "../pages/Translations/ListTranslations";
import TranslationForm from "../pages/Translations/TranslationForm";

export const productRoutes = [
  // ProductType
  { path: "product-types", element: <PTList /> },
  { path: "product-types/new", element: <PTForm /> },
  { path: "product-types/:id", element: <ProductTypeEdit /> },

  // Category
  { path: "categories", element: <CategoryList /> },
  { path: "categories/new", element: <CategoryForm /> },
  { path: "categories/:id", element: <CategoryEdit /> },

  // Products
  { path: "products", element: <ProductList /> },
  { path: "products/new", element: <ProductForm /> },
  { path: "products/:id", element: <ProductEdit /> },

  // Unit
  { path: "units", element: <UnitList /> },
  { path: "units/new", element: <UnitForm /> },
  { path: "units/:id", element: <UnitEdit /> },

  // UnitSize
  { path: "unit-sizes", element: <UnitSizeList /> },
  { path: "unit-sizes/new", element: <UnitSizeForm /> },
  { path: "unit-sizes/:id", element: <UnitSizeEdit /> },

  // UnitConversion
  { path: "unit-conversions", element: <UnitConversionList /> },
  { path: "unit-conversions/new", element: <UnitConversionForm /> },
  { path: "unit-conversions/:id", element: <UnitConversionEdit /> },

  // Product Size Setting
  { path: "product-size-settings", element: <ProductSizeSettingList /> },
  { path: "product-size-settings/new", element: <ProductSizeSettingForm /> },
  { path: "product-size-settings/:id", element: <ProductSizeSettingForm /> },


// Language Settings routes
  { path: "translations", element: <ListTranslations /> },
  { path: "translations/new", element: <TranslationForm /> },
  { path: "translations/:id/edit", element: <TranslationForm /> },
];
