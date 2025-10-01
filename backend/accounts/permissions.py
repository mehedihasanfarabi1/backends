from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from users.models import UserPermissionSet

# কোন কোন module-এর কি কি permission থাকবে
ACCOUNTS_PERMISSIONS = {
    "account_head": ["create", "view", "edit", "delete"],
    "account": ["create", "view", "edit", "delete"],
}


def get_all_account_permissions():
    """
    AccountHead & Account মডিউলের সব permissions list করে return করবে
    """
    permissions = []
    for module, actions in ACCOUNTS_PERMISSIONS.items():
        for action in actions:
            permissions.append({
                "module": module,
                "action": action,
                "code": f"{module}_{action}"
            })
    return permissions



class AccountHeadModulePermission(BasePermission):
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
            accounts_module = p.accounts_module
            if isinstance(accounts_module, str):
                import json
                try:
                    accounts_module = json.loads(accounts_module)
                except json.JSONDecodeError:
                    accounts_module = {}
            elif accounts_module is None:
                accounts_module = {}

            # Ensure module_name exists
            module_perms = accounts_module.get(module_name, {})
            if module_perms.get(action_perm, False):
                return True

        raise PermissionDenied(f"You cannot perform {action_perm} on {module_name}")
