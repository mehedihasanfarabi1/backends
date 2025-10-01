import { generateCrudRoutes } from "../utils/routeGenerator";
import ProtectedRoute from "../contexts/ProtectedRoute";
// ProductType
import PTList from "../modules/products/ProductType/List";
import PTForm from "../modules/products/ProductType/Form";
import ProductTypeEdit from "../modules/products/ProductType/Edit";

// Category
import CategoryList from "../modules/products/Category/List";
import CategoryForm from "../modules/products/Category/Form";
import CategoryEdit from "../modules/products/Category/Edit";

// Product
import ProductList from "../modules/products/Product/List";
import ProductForm from "../modules/products/Product/Form";
import ProductEdit from "../modules/products/Product/Edit";

// Unit
import UnitList from "../modules/products/Unit/List";
import UnitForm from "../modules/products/Unit/Form";
import UnitEdit from "../modules/products/Unit/Edit";

// UnitSize
import UnitSizeList from "../modules/products/UnitSize/List";
import UnitSizeForm from "../modules/products/UnitSize/Form";
import UnitSizeEdit from "../modules/products/UnitSize/Edit";

// UnitConversion
import UnitConversionList from "../modules/products/UnitConversion/List";
import UnitConversionForm from "../modules/products/UnitConversion/Form";
import UnitConversionEdit from "../modules/products/UnitConversion/Edit";

// ProductSizeSetting
import ProductSizeSettingList from "../modules/products/ProductSizeSetting/List";
import ProductSizeSettingForm from "../modules/products/ProductSizeSetting/Form";

// Translations
import ListTranslations from "../pages/Translations/ListTranslations";
import TranslationForm from "../pages/Translations/TranslationForm";

export const productRoutes = [
  ...generateCrudRoutes("product-types", { List: PTList, Create: PTForm, Edit: ProductTypeEdit }, {
    listPerm: "product_type_view",
    createPerm: "product_type_create",
    editPerm: "product_type_edit"
  }),

  ...generateCrudRoutes("categories", { List: CategoryList, Create: CategoryForm, Edit: CategoryEdit }, {
    listPerm: "category_view",
    createPerm: "category_create",
    editPerm: "category_edit"
  }),

  ...generateCrudRoutes("products", { List: ProductList, Create: ProductForm, Edit: ProductEdit }, {
    listPerm: "product_view",
    createPerm: "product_create",
    editPerm: "product_edit"
  }),

  ...generateCrudRoutes("units", { List: UnitList, Create: UnitForm, Edit: UnitEdit }, {
    listPerm: "unit_view",
    createPerm: "unit_create",
    editPerm: "unit_edit"
  }),

  ...generateCrudRoutes("unit-sizes", { List: UnitSizeList, Create: UnitSizeForm, Edit: UnitSizeEdit }, {
    listPerm: "unit_size_view",
    createPerm: "unit_size_create",
    editPerm: "unit_size_edit"
  }),

  ...generateCrudRoutes("unit-conversions", { List: UnitConversionList, Create: UnitConversionForm, Edit: UnitConversionEdit }, {
    listPerm: "unit_conversion_view",
    createPerm: "unit_conversion_create",
    editPerm: "unit_conversion_edit"
  }),

  ...generateCrudRoutes("product-size-settings", { List: ProductSizeSettingList, Create: ProductSizeSettingForm, Edit: ProductSizeSettingForm }, {
    listPerm: "product_size_setting_view",
    createPerm: "product_size_setting_create",
    editPerm: "product_size_setting_edit"
  }),

  // Translations manual
  { path: "translations", element: <ListTranslations /> },
  { path: "translations/new", element: <TranslationForm /> },
  { path: "translations/:id/edit", element: <TranslationForm />},
];
