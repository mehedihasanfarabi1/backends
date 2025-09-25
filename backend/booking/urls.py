from django.urls import path, include
from rest_framework.routers import DefaultRouter
from booking.views.bookingView import BookingViewSet
from booking.views.permissionView import BookingPermissionListView

router = DefaultRouter()

router.register(r'booking', BookingViewSet, basename='booking')


urlpatterns = [
    path("", include(router.urls)),
    path("permissions/", BookingPermissionListView.as_view(), name="booking-permissions"),

]
