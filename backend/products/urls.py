from django.urls import path, include
from rest_framework.routers import DefaultRouter
from products.views.productTypeView import ProductTypeViewSet
from products.views.categoryView import CategoryViewSet
from products.views.productView import ProductViewSet
from products.views.unitView import UnitViewSet
from products.views.unitSizeView import UnitSizeViewSet
from products.views.unitConversionView import UnitConversionViewSet
from products.views.productSizeSettingView import ProductSizeSettingViewSet
from products.views.permissionView import PermissionListView

router = DefaultRouter()
router.register(r'product-types', ProductTypeViewSet, basename="product-type")
router.register(r'categories', CategoryViewSet, basename="category")
router.register(r'products', ProductViewSet, basename="product")
router.register(r'units', UnitViewSet, basename="unit")
router.register(r'unit-sizes', UnitSizeViewSet, basename="unit-size")
router.register(r'unit-conversions', UnitConversionViewSet, basename="unit-conversion")
router.register(r'product-size-settings', ProductSizeSettingViewSet, basename="product-size-setting")

urlpatterns = [
    path("permissions/", PermissionListView.as_view(), name="permission-list"),
    path("", include(router.urls)),
]
