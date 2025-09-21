from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),  # ✅ users.urls 
    path("api/", include("language.urls")), # language routes
    path("api/", include("alldepartments.urls")), # department routes
    path("api/products/", include("products.urls")), # products routes
    path("api/company/", include("company.urls")), # company routes
    # path("api/", include("permissions.urls")), # permission routes
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
