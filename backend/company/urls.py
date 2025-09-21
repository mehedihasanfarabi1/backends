from django.urls import path, include
from rest_framework.routers import DefaultRouter
from company.views.companyView import CompanyViewSet,CompanyDetailsView
from company.views.businessTypeView import BusinessTypeViewSet
from company.views.factoryView import FactoryViewSet
from company.views.permissionView import CompanyPermissionListView

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'business-types', BusinessTypeViewSet)
router.register(r'factories', FactoryViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("permissions/", CompanyPermissionListView.as_view(), name="company-permissions"),
    path("details/<int:company_id>/", CompanyDetailsView.as_view(), name="company-details"),
]
