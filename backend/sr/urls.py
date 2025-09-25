from django.urls import path, include
from rest_framework.routers import DefaultRouter
from sr.views.srView import SRViewSet,NextSRNoView
from sr.views.permissionView import SRPermissionListView as SR
router = DefaultRouter()
router.register(r'srs', SRViewSet, basename='sr')

urlpatterns = [
    path("", include(router.urls)),
    path("next_sr/", NextSRNoView.as_view(), name="next-sr-no"),
    path("permissions/", SR.as_view(), name="sr-permissions"),
]
