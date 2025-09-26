# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from backend.mixins import AuditMixin

# ======================
# User Model
# ======================
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email must be provided")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin,AuditMixin):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    role = models.ForeignKey("Role", on_delete=models.SET_NULL, null=True, blank=True, related_name='users',default=None)
    is_logged_in = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser


# ======================
# Permission System
# ======================

# Master list of permissions
class Permission(AuditMixin):
    code = models.CharField(max_length=100, unique=True)   # e.g. "product_type_create"
    name = models.CharField(max_length=200)                # e.g. "Create Product Type"
    module = models.CharField(max_length=100)              # e.g. "product_type"

    def __str__(self):
        return f"{self.module} → {self.name}"


# Roles
class Role(AuditMixin):
    name = models.CharField(max_length=100, unique=True)  # e.g. "Admin", "Manager"

    def __str__(self):
        return self.name



# ======================
# Final Hybrid Permission Model (All in one row)
# ======================
class UserPermissionSet(AuditMixin):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="permission_sets")
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, default=None, related_name="permission_sets")

    # Multi-tenant references
    companies = models.JSONField(default=list, blank=True, null=True)
    business_types = models.JSONField(default=dict, blank=True, null=True)
    factories = models.JSONField(default=dict, blank=True, null=True)

    # Module-wise permissions (JSON inside each column)
    product_module = models.JSONField(default=dict, blank=True, null=True)
    company_module = models.JSONField(default=dict, blank=True, null=True)
    hr_module = models.JSONField(default=dict, blank=True, null=True)
    accounts_module = models.JSONField(default=dict, blank=True, null=True)
    inventory_module = models.JSONField(default=dict, blank=True, null=True)
    settings_module = models.JSONField(default=dict, blank=True, null=True)
    party_type_module = models.JSONField(default=dict, blank=True, null=True)
    sr_module = models.JSONField(default=dict, blank=True, null=True)
    booking_module = models.JSONField(default=dict, blank=True, null=True)
    loan_module = models.JSONField(default=dict, blank=True, null=True)
    pallot_module = models.JSONField(default=dict, blank=True, null=True)
    delivery_module = models.JSONField(default=dict, blank=True, null=True)
    ledger_module = models.JSONField(default=dict, blank=True, null=True)

    def __str__(self):
        return f"PermissionSet → {self.user.email}"

