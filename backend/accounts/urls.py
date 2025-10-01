from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.views.accountsHeadView import AccountHeadViewSet
from accounts.views.permissionView import AccountPermissionListView
router = DefaultRouter()

router.register(r'account-head', AccountHeadViewSet, basename='account-head')

urlpatterns = [
    path("", include(router.urls)),
    path("permissions/", AccountPermissionListView.as_view(), name="company-permissions"),

]
