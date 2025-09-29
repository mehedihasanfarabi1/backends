from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from users.models import UserPermissionSet

# কোন কোন module-এর কি কি permission থাকবে
LOAN_PERMISSIONS = {
    "loan_type": ["create", "view", "edit", "delete"],
    "loan": ["create", "view", "edit", "delete"],
}


def get_all_loan_module_permissions():
    """
    LoanType & Loan মডিউলের সব permissions list করে return করবে
    """
    permissions = []
    for module, actions in LOAN_PERMISSIONS.items():
        for action in actions:
            permissions.append({
                "module": module,
                "action": action,
                "code": f"{module}_{action}"
            })
    return permissions



class LoanModulePermission(BasePermission):
    ACTION_MAP = {
        "list": "view",
        "retrieve": "view",
        "create": "create",
        "update": "edit",
        "partial_update": "edit",
        "destroy": "delete",
        "get": "view",
        "post": "create",
        "put": "edit",
        "patch": "edit",
        "delete": "delete",
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

        action = (getattr(view, "action", None) or request.method).lower()
        action_perm = self.ACTION_MAP.get(action)
        if not action_perm:
            return True

        perms = UserPermissionSet.objects.filter(user=user)
        for p in perms:
            loan_module = self._parse_permissions(p.loan_module)
            module_perms = loan_module.get(module_name, {})
            if module_perms.get(action_perm, False):
                return True

        raise PermissionDenied(f"You cannot perform {action_perm} on {module_name}")

    def _parse_permissions(self, raw_perm):
        import json
        if isinstance(raw_perm, str):
            try:
                return json.loads(raw_perm)
            except json.JSONDecodeError:
                return {}
        return raw_perm or {}
