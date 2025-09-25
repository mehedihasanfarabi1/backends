from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from users.models import UserPermissionSet

# কোন কোন module-এর কি কি permission থাকবে
PARTY_TYPE_PERMISSIONS = {
    "party_type": ["create", "view", "edit", "delete"],
    "party": ["create", "view", "edit", "delete"],
}


def get_all_party_type_permissions():
    """
    PartyType & Party মডিউলের সব permissions list করে return করবে
    """
    permissions = []
    for module, actions in PARTY_TYPE_PERMISSIONS.items():
        for action in actions:
            permissions.append({
                "module": module,
                "action": action,
                "code": f"{module}_{action}"
            })
    return permissions



class PartyTypeModulePermission(BasePermission):
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
            party_type_module = p.party_type_module
            if isinstance(party_type_module, str):
                import json
                try:
                    party_type_module = json.loads(party_type_module)
                except json.JSONDecodeError:
                    party_type_module = {}
            elif party_type_module is None:
                party_type_module = {}

            # Ensure module_name exists
            module_perms = party_type_module.get(module_name, {})
            if module_perms.get(action_perm, False):
                return True

        raise PermissionDenied(f"You cannot perform {action_perm} on {module_name}")
