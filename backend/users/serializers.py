# users/serializers.py
from rest_framework import serializers
from .models import CustomUser, Role, Permission,UserPermissionSet
from company.models.company import Company
from company.models.business_type import BusinessType
from company.models.factory import Factory
from backend.AuditSerializerMixin import AuditSerializerMixin

class RoleSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name"]

class UserSerializer(AuditSerializerMixin, serializers.ModelSerializer):
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


class PermissionSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ["id", "code", "name", "module"]




# ------------------------------
# Hybrid Permission Serializers
# ------------------------------
from .models import UserPermissionSet

class UserPermissionSetSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = UserPermissionSet
        fields = "__all__"
