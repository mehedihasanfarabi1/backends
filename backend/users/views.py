from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import (
    CustomUser, 
    Role, Permission,UserPermissionSet
)
from .serializers import (
    UserSerializer, RegisterSerializer, 
    RoleSerializer, PermissionSerializer, 
    UserRoleUpdateSerializer
)

# ------------------------------
# Custom Login
# ------------------------------
class CustomLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
        
        user.is_logged_in = True
        user.save()
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        user_data = UserSerializer(user).data

        return Response({
            "refresh": str(refresh),
            "access": access,
            "user": user_data,
        }, status=status.HTTP_200_OK)


# ------------------------------
# Register
# ------------------------------
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer


# ------------------------------
# User List & Profile
# ------------------------------
class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


# ------------------------------
# User ViewSet for toggle & me
# ------------------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    # Toggle active status
    @action(detail=True, methods=["post"])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({"id": user.id, "is_active": user.is_active})

    # Me endpoint
    @action(detail=False, methods=["get"])
    def me(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"])
    def update_role(self, request, pk=None):
        user = self.get_object()
        serializer = UserRoleUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "role": RoleSerializer(user.role).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# ------------------------------
# Role ViewSet
# ------------------------------
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


# ------------------------------
# Permission ViewSet
# ------------------------------
class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]







# ------------------------------
# Logout
# ------------------------------
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
            user = request.user
            user.is_logged_in = False  # ✅ Mark logged out
            user.save()
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"detail": "Logged out successfully."})
    except Exception:
        return Response({"detail": "Invalid token"}, status=400)



# ------------------------------
# Hybrid Permission ViewSets
# ------------------------------
from .models import UserPermissionSet
from .serializers import UserPermissionSetSerializer

class UserPermissionSetViewSet(viewsets.ModelViewSet):
    queryset = UserPermissionSet.objects.all()
    serializer_class = UserPermissionSetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        
        user = self.request.user
        if user.is_superuser:
            return UserPermissionSet.objects.all()
        return UserPermissionSet.objects.filter(user=user)   

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def by_user(self, request, user_id=None):
        sets = UserPermissionSet.objects.filter(user_id=user_id)
        serializer = self.get_serializer(sets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='update-or-create')
    def update_or_create_set(self, request):
        user_id = request.data.get("user")
        role = request.data.get("role")
        companies = request.data.get("companies", [])
        business_types = request.data.get("business_types", {})
        factories = request.data.get("factories", {})

        # sanitize factories → ensure all objects have factory_id & business_type_id
        clean_factories = {}
        for company_id, items in (factories or {}).items():
            clean_items = []
            for f in items:
                if "factory_id" in f and "business_type_id" in f:
                    clean_items.append(f)
                elif "id" in f and "btId" in f:
                    clean_items.append({"factory_id": f["id"], "business_type_id": f["btId"]})
            # ✅ remove duplicates
            unique_items = []
            seen = set()
            for f in clean_items:
                key = (f["factory_id"], f["business_type_id"])
                if key not in seen:
                    unique_items.append(f)
                    seen.add(key)
            clean_factories[company_id] = unique_items

        # modules
        product_module = request.data.get("product_module", {})
        company_module = request.data.get("company_module", {})
        hr_module = request.data.get("hr_module", {})
        accounts_module = request.data.get("accounts_module", {})
        inventory_module = request.data.get("inventory_module", {})
        settings_module = request.data.get("settings_module", {})
        party_type_module = request.data.get("party_type_module", {})
        sr_module = request.data.get("sr_module", {})
        booking_module = request.data.get("booking_module", {})
        loan_module = request.data.get("loan_module", {})
        pallot_module = request.data.get("pallot_module", {})
        delivery_module = request.data.get("delivery_module", {})
        ledger_module = request.data.get("ledger_module", {})
        # ✅ Superuser হলে যেকোনো user-এর permission তৈরি/আপডেট করতে পারবে
        if not request.user.is_superuser and str(request.user.id) != str(user_id):
            return Response({"detail": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        
        obj, created = UserPermissionSet.objects.update_or_create(
            user_id=user_id,
            defaults={
                "role_id": role,
                "companies": companies,
                "business_types": business_types,
                "factories": clean_factories, 
                "product_module": product_module,
                "company_module": company_module,
                "hr_module": hr_module,
                "accounts_module": accounts_module,
                "inventory_module": inventory_module,
                "settings_module": settings_module,
                "party_type_module": party_type_module,
                "sr_module": sr_module,
                "booking_module": booking_module,
                "loan_module": loan_module,
                "pallot_module": pallot_module,
                "delivery_module": delivery_module,
                "ledger_module": ledger_module,
            }
        )

        serializer = self.get_serializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)



