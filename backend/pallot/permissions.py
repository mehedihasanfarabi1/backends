from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from users.models import UserPermissionSet
import json

# কোন কোন module-এর কি কি permission থাকবে
PALLOT_PERMISSIONS = {
    "pallot_type": ["create", "view", "edit", "delete"],
    "pallot": ["create", "view", "edit", "delete"],
    "chamber": ["create", "view", "edit", "delete"],
    "floor": ["create", "view", "edit", "delete"],
    "pocket": ["create", "view", "edit", "delete"],
}


def get_all_pallot_permissions():

    permissions = []
    for module, actions in PALLOT_PERMISSIONS.items():
        for action in actions:
            permissions.append({
                "module": module,
                "action": action,
                "code": f"{module}_{action}"
            })
    return permissions


class PallotModulePermission(BasePermission):
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

        # superuser or staff সবকিছু bypass করবে
        if user.is_superuser or user.is_staff:
            return True

        module_name = getattr(view, "module_name", None)
        if not module_name:
            return True

        action = getattr(view, "action", None) or request.method
        action_perm = self.ACTION_MAP.get(action)
        if not action_perm:
            return True

        # DB থেকে user permissions বের করা
        perms = UserPermissionSet.objects.filter(user=user)
        for p in perms:
            pallot_module = p.pallot_module
            if isinstance(pallot_module, str):
                try:
                    pallot_module = json.loads(pallot_module)
                except json.JSONDecodeError:
                    pallot_module = {}
            elif pallot_module is None:
                pallot_module = {}

            module_perms = pallot_module.get(module_name, {})
            if module_perms.get(action_perm, False):
                return True

        raise PermissionDenied(f"You cannot perform {action_perm} on {module_name}")
