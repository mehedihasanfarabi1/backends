from django.urls import path, include
from rest_framework.routers import DefaultRouter
from party_type.views.party_typeView import PartyTypeViewSet
from party_type.views.partyView import NextPartyCodeView, PartyViewSet
from party_type.views.permissionView import PartyTypePermissionListView
router = DefaultRouter()

router.register(r'party-types', PartyTypeViewSet, basename='party-type')
router.register(r'parties', PartyViewSet, basename='party')

urlpatterns = [
    path("", include(router.urls)),
    path("permissions/", PartyTypePermissionListView.as_view(), name="company-permissions"),

     path("next-code/", NextPartyCodeView.as_view(), name="party-next-code"),  # ✅ trailing slash

]
