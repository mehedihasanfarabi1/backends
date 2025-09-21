from django.shortcuts import render

from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt

# ডেমো ডাটা
USERS = [
    {"id": 1, "name": "Alice", "email": "alice@example.com"},
    {"id": 2, "name": "Bob",   "email": "bob@example.com"},
]

@ensure_csrf_cookie
def whoami(request):
    # প্রথম GET করলে ব্রাউজারে csrftoken কুকি সেট হবে
    return JsonResponse({"ok": True})

@require_GET
def users_list(request):
    return JsonResponse(USERS, safe=False)

@require_POST
def add_user(request):
    # খুব সিম্পল ডেমো—ফর্ম data ধরছি
    name = request.POST.get("name", "")
    email = request.POST.get("email", "")
    new = {"id": len(USERS)+1, "name": name, "email": email}
    USERS.append(new)
    return JsonResponse(new, status=201)
