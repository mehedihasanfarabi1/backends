import React from "react";
import PTList from "../modules/products/ProductType/List";
import PTForm from "../modules/products/ProductType/Form";
import CategoryList from "../modules/products/Category/List";
import CategoryForm from "../modules/products/Category/Form";
import ItemList from "../modules/products/Item/List";
import ItemForm from "../modules/products/Item/Form";
import UnitList from "../modules/products/Unit/List";
import UnitForm from "../modules/products/Unit/Form";
import UnitSizeList from "../modules/products/UnitSize/List";
import UnitSizeForm from "../modules/products/UnitSize/Form";
import UnitConversionList from "../modules/products/UnitConversion/List";
import UnitConversionForm from "../modules/products/UnitConversion/Form";

export const productRoutes = [
  // ProductType
  { path: "product-types", element: <PTList /> },
  { path: "product-types/new", element: <PTForm /> },
  { path: "product-types/:id", element: <PTForm /> },

  // Category
  { path: "categories", element: <CategoryList /> },
  { path: "categories/new", element: <CategoryForm /> },
  { path: "categories/:id", element: <CategoryForm /> },

  // Products
  { path: "products", element: <ItemList /> },
  { path: "products/new", element: <ItemForm /> },
  { path: "products/:id", element: <ItemForm /> },

  // Unit
  { path: "units", element: <UnitList /> },
  { path: "units/new", element: <UnitForm /> },
  { path: "units/:id", element: <UnitForm /> },

  // UnitSize
  { path: "unit-sizes", element: <UnitSizeList /> },
  { path: "unit-sizes/new", element: <UnitSizeForm /> },
  { path: "unit-sizes/:id", element: <UnitSizeForm /> },

  // UnitConversion
  { path: "unit-conversions", element: <UnitConversionList /> },
  { path: "unit-conversions/new", element: <UnitConversionForm /> },
  { path: "unit-conversions/:id", element: <UnitConversionForm /> },
];
