# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from company.models.company import Company
from company.models.business_type import BusinessType
from company.models.factory import Factory

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


class CustomUser(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

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



# Roles
class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)  # e.g. "Admin", "Manager"

    def __str__(self):
        return self.name






# ======================
# Hybrid Permission Model
# ======================

class UserPermissionSet(models.Model):
    """
    Parent table → কোন user কোন company/business/factory context এ permission set রাখছে
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="permission_sets")
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, default=None, related_name="permission_sets")

    # Multi-tenant references
    companies = models.JSONField(default=list, blank=True, null=True)        # [1,2,3]
    business_types = models.JSONField(default=dict, blank=True, null=True)  # { "1": [1,2], "2": [3] }
    factories = models.JSONField(default=dict, blank=True, null=True)       # { "1": [2,3], "2": [4] }
    browser_history = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    login_time = models.DateTimeField(default=timezone.now)
    logout_time = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"PermissionSet → {self.user.email}"


class UserModulePermission(models.Model):
    """
    Child table → প্রতি module এর জন্য JSON আকারে permission রাখা হবে
    Example:
    {
        "productType": { "create": true, "edit": true, "delete": false, "view": true },
        "category": { "create": true, "edit": false, "delete": false, "view": true }
    }
    """
    permission_set = models.ForeignKey(UserPermissionSet, on_delete=models.CASCADE, related_name="module_permissions")
    module_name = models.CharField(max_length=100)  # e.g. "products", "company", "hr"
    permissions = models.JSONField(default=dict, blank=True, null=True)

    def __str__(self):
        return f"{self.permission_set.user.email} → {self.module_name}"