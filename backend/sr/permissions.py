from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from users.models import UserPermissionSet
import json

SR_PERMISSIONS = {
    "sr": ["create", "view", "edit", "delete"],
}

def get_all_sr_permissions():
    permissions = []
    for module, actions in SR_PERMISSIONS.items():
        for action in actions:
            permissions.append({
                "module": module,
                "action": action,
                "code": f"{module}_{action}"
            })
    return permissions

class SRModulePermission(BasePermission):
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
            return True

        module_name = getattr(view, "module_name", None)
        if not module_name:
            return True

        action = getattr(view, "action", None) or request.method
        action_perm = self.ACTION_MAP.get(action)
        if not action_perm:
            return True

        perms = UserPermissionSet.objects.filter(user=user)
        for p in perms:
            sr_module = p.sr_module
            if isinstance(sr_module, str):
                try:
                    sr_module = json.loads(sr_module)
                except:
                    sr_module = {}
            elif sr_module is None:
                sr_module = {}

            module_perms = sr_module.get(module_name, {})
            if module_perms.get(action_perm, False):
                return True

        raise PermissionDenied(f"You cannot perform {action_perm} on {module_name}")
