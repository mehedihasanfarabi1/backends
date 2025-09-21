# products/permissions.py
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from users.models import UserPermissionSet

# ===========================
# Product / Module Permissions
# ===========================

PRODUCT_PERMISSIONS = {
    "product_type": ["create", "view", "edit", "delete"],
    "category": ["create", "view", "edit", "delete"],
    "product": ["create", "view", "edit", "delete"],
    "unit": ["create", "view", "edit", "delete"],
    "unit_size": ["create", "view", "edit", "delete"],
    "unit_conversion": ["create", "view", "edit", "delete"],
    "product_size_setting": ["create", "view", "edit", "delete"],
}


def get_all_module_permissions():
    permissions = []
    for module, actions in PRODUCT_PERMISSIONS.items():
        for action in actions:
            permissions.append({
                "module": module,
                "action": action,
                "code": f"{module}_{action}"
            })
    return permissions


# ===========================
# DRF Module Permission Class
# ===========================

class ModulePermission(BasePermission):
    """
    Checks if a user has permission for a specific module and action.
    """
    ACTION_MAP = {
        "list": "view",
        "retrieve": "view",
        "create": "create",
        "update": "edit",
        "partial_update": "edit",
        "destroy": "delete",
    }

    def has_permission(self, request, view):
        user = request.user
        module_name = getattr(view, "module_name", None)
        action_perm = self.ACTION_MAP.get(view.action)

        # Superusers and staff bypass all permission checks
        if user.is_superuser or user.is_staff:
            return True

        # Fetch user permission sets
        perms = UserPermissionSet.objects.filter(user=user)

        # Check each permission set
        for p in perms:
            # product_module should be a dict like:
            # {"category": {"view": True, "create": False, "edit": True, "delete": False}}
            module_perms = (p.product_module or {}).get(module_name, {})

            # If permission exists, allow access
            if module_perms.get(action_perm, False):
                return True

        # If none matched, deny
        return False

    def has_object_permission(self, request, view, obj):
        """
        Optional: Use this if you want object-level permission filtering
        """
        return self.has_permission(request, view)
