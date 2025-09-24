# users/serializers.py
from rest_framework import serializers
from .models import CustomUser, UserPermission, Role, Permission, RolePermission, UserRole,UserPermissionSet
from company.models.company import Company
from company.models.business_type import BusinessType
from company.models.factory import Factory


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name"]

class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)  # show role info
    class Meta:
        model = CustomUser
        fields = ["id", "email", "name", "phone", "address","is_active","is_logged_in","role"]

class UserRoleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["role"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["id", "email", "name", "password", "phone", "address"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser.objects.create_user(password=password, **validated_data)
        return user


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ["id", "code", "name", "module"]





class RolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePermission
        fields = ["id", "role", "permission"]


class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ["id", "user", "role"]


class UserPermissionSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all(), allow_null=True, required=False)
    business_type = serializers.PrimaryKeyRelatedField(queryset=BusinessType.objects.all(), allow_null=True, required=False)
    factory = serializers.PrimaryKeyRelatedField(queryset=Factory.objects.all(), allow_null=True, required=False)
    permission = PermissionSerializer(read_only=True)
    permission_id = serializers.PrimaryKeyRelatedField(
        queryset=UserPermissionSet.objects.all(),
        source="permission",
        write_only=True
    )

    class Meta:
        model = UserPermission
        fields = [
            "id", "user", "company", "business_type", "factory",
            "permission", "permission_id",
            "browser_history", "ip_address", "login_time", "logout_time"
        ]



# ------------------------------
# Hybrid Permission Serializers
# ------------------------------
from .models import UserPermissionSet, UserModulePermission

class UserModulePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModulePermission
        fields = ["id", "module_name", "permissions"]

class UserPermissionSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPermissionSet
        fields = "__all__"
# class UserPermissionSetSerializer(serializers.ModelSerializer):
#     module_permissions = UserModulePermissionSerializer(many=True)

#     class Meta:
#         model = UserPermissionSet
#         fields = [
#             "id", "user", "role", 
#             "companies", "business_types", "factories",
#             "browser_history", "ip_address", "login_time", "logout_time",
#             "created_at", "updated_at", "module_permissions"
#         ]

#     def create(self, validated_data):
#         modules_data = validated_data.pop("module_permissions", [])
#         permission_set = UserPermissionSet.objects.create(**validated_data)
#         for module_data in modules_data:
#             UserModulePermission.objects.create(permission_set=permission_set, **module_data)
#         return permission_set

#     def update(self, instance, validated_data):
#         modules_data = validated_data.pop("module_permissions", [])
#         # Update parent fields
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()
#         # Update child module permissions
#         for module_data in modules_data:
#             module_name = module_data.get("module_name")
#             ump, created = UserModulePermission.objects.get_or_create(
#                 permission_set=instance, module_name=module_name
#             )
#             ump.permissions = module_data.get("permissions", {})
#             ump.save()
#         return instance
