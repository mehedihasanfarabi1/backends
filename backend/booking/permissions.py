from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from users.models import UserPermissionSet


BOOKING_PERMISSIONS = {
    "booking": ["create", "view", "edit", "delete"],
    
}


def get_all_booking_permissions():

    permissions = []
    for module, actions in BOOKING_PERMISSIONS.items():
        for action in actions:
            permissions.append({
                "module": module,
                "action": action,
                "code": f"{module}_{action}"
            })
    return permissions



class BookingModulePermission(BasePermission):
    ACTION_MAP = {
        "list": "view",
        "retrieve": "view",
        "create": "create",
        "update": "edit",
        "partial_update": "edit",
        "destroy": "delete",
        "GET": "view",
        "POST": "create",
        "PUT": "edit",
        "PATCH": "edit",
        "DELETE": "delete",
    }

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        if user.is_superuser or user.is_staff:
            return True  # bypass for admins

        module_name = getattr(view, "module_name", None)
        if not module_name:
            return True

        action = getattr(view, "action", None) or request.method
        action_perm = self.ACTION_MAP.get(action)
        if not action_perm:
            return True

        perms = UserPermissionSet.objects.filter(user=user)
        for p in perms:
            booking_module = p.booking_module
            if isinstance(booking_module, str):
                import json
                try:
                    booking_module = json.loads(booking_module)
                except json.JSONDecodeError:
                    booking_module = {}
            elif booking_module is None:
                booking_module = {}

            # Ensure module_name exists
            module_perms = booking_module.get(module_name, {})
            if module_perms.get(action_perm, False):
                return True

        raise PermissionDenied(f"You cannot perform {action_perm} on {module_name}")
