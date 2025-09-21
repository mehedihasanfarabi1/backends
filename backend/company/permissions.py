# company/permissions.py
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from users.models import UserPermissionSet

COMPANY_PERMISSIONS = {
    "company": ["create", "view", "edit", "delete"],
    "business_type": ["create", "view", "edit", "delete"],
    "factory": ["create", "view", "edit", "delete"],
}


def get_all_company_permissions():
    permissions = []
    for module, actions in COMPANY_PERMISSIONS.items():
        for action in actions:
            permissions.append({
                "module": module,
                "action": action,
                "code": f"{module}_{action}"
            })
    return permissions


class CompanyModulePermission(BasePermission):
    """
    এই permission class টি Company ViewSet এবং CompanyDetailsView (APIView) উভয়ের জন্য কাজ করবে।
    ViewSet হলে: view.action থেকে action নেবে
    APIView হলে: request.method থেকে action map করবে
    """

    # ViewSet action / HTTP method অনুযায়ী permission map
    ACTION_MAP = {
        "list": "view",
        "retrieve": "view",
        "create": "create",
        "update": "edit",
        "partial_update": "edit",
        "destroy": "delete",

        # APIView এর জন্য HTTP method mapping
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

        # Module name
        module_name = getattr(view, "module_name", None)
        if not module_name:
            return True  # যদি module_name না থাকে, permission skip করবে

        # ViewSet হলে view.action ব্যবহার কর
        action = getattr(view, "action", None)
        # যদি action না থাকে, তাহলে HTTP method ব্যবহার কর
        if not action:
            action = request.method

        action_perm = self.ACTION_MAP.get(action)
        if not action_perm:
            return True  # যদি mapping না থাকে, skip permission

        # User permission sets fetch
        perms = UserPermissionSet.objects.filter(user=user)
        for p in perms:
            company_module = p.company_module or {}
            module_perms = company_module.get(module_name, {})
            if module_perms.get(action_perm, False):
                return True

        # If no permissions
        raise PermissionDenied(f"You can not do this action !!!: {action_perm} {module_name}.")