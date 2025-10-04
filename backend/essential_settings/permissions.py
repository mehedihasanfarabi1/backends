from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from users.models import UserPermissionSet

SETTINGS_PERMISSIONS = {
  "bag_type": ["create", "view", "edit", "delete"],
  "loan_type": ["create", "view", "edit", "delete"],
  "conditions": ["create", "view", "edit", "delete"],
  "pc_settings": ["create", "view", "edit", "delete"],
  "shed_settings": ["create", "view", "edit", "delete"],
  "general_settings": ["create", "view", "edit", "delete"],
  "basic_settings": ["create", "view", "edit", "delete"],
  "transaction_settings": ["create", "view", "edit", "delete"]
}

def get_all_settings_permissions():

    permissions = []
    for module, actions in SETTINGS_PERMISSIONS.items():
        for action in actions:
            permissions.append({
                "module": module,
                "action": action,
                "code": f"{module}_{action}"
            })
    return permissions



class SettingsModulePermission(BasePermission):
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
            settings_module = p.settings_module
            if isinstance(settings_module, str):
                import json
                try:
                    settings_module = json.loads(settings_module)
                except json.JSONDecodeError:
                    settings_module = {}
            elif settings_module is None:
                settings_module = {}

            # Ensure module_name exists
            module_perms = settings_module.get(module_name, {})
            if module_perms.get(action_perm, False):
                return True

        raise PermissionDenied(f"You cannot perform {action_perm} on {module_name}")
