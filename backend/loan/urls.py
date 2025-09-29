from django.urls import path, include
from rest_framework.routers import DefaultRouter
from loan.views.loanTypeView import LoanTypeViewSet
from loan.views.permissionView import LoanModulePermissionListView
router = DefaultRouter()

router.register(r'loan-types', LoanTypeViewSet, basename='loan-type')

urlpatterns = [
    path("", include(router.urls)),
    path("permissions/", LoanModulePermissionListView.as_view(), name="loan-permissions"),


]
