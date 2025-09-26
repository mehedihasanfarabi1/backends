from django.urls import path, include
from rest_framework.routers import DefaultRouter
from pallot.views.pallotTypeView import PallotTypeViewSet
from pallot.views.permissionView import PallotPermissionListView
router = DefaultRouter()

router.register(r'pallot_types', PallotTypeViewSet, basename='pallot-type')


urlpatterns = [
    path("", include(router.urls)),
    path("permissions/", PallotPermissionListView.as_view(), name="pallot-permissions"),
]
