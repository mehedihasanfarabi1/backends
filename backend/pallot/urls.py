from django.urls import path, include
from rest_framework.routers import DefaultRouter
from pallot.views.pallotView import PallotViewSet
from pallot.views.pallotTypeView import PallotTypeViewSet
from pallot.views.permissionView import PallotPermissionListView
from pallot.views.pallotLocationView import ChamberViewSet, FloorViewSet, PocketViewSet
router = DefaultRouter()

router.register(r'pallot_types', PallotTypeViewSet, basename='pallot-type')
router.register(r"chambers", ChamberViewSet, basename="chamber")
router.register(r"floors", FloorViewSet, basename="floor")
router.register(r"pockets", PocketViewSet, basename="pocket")
router.register(r"pallots", PallotViewSet, basename="pallot")


urlpatterns = [
    path("", include(router.urls)),
    path("permissions/", PallotPermissionListView.as_view(), name="pallot-permissions"),
    path("get_sr_quantity/", PallotViewSet.as_view({"get": "get_sr_quantity"}), name="get-sr-quantity"),
]
