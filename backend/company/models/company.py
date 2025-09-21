from django.db import models
from django.conf import settings

# যদি global AuditMixin থাকে backend/mixins.py এ, সেটা ইউজ করো
try:
    from backend.mixins import AuditMixin
except Exception:
    class AuditMixin(models.Model):
        created_at = models.DateTimeField(auto_now_add=True)
        modified_at = models.DateTimeField(auto_now=True)
        created_by = models.ForeignKey(
            settings.AUTH_USER_MODEL,
            null=True, blank=True,
            on_delete=models.SET_NULL,
            related_name="%(class)s_created"
        )
        modified_by = models.ForeignKey(
            settings.AUTH_USER_MODEL,
            null=True, blank=True,
            on_delete=models.SET_NULL,
            related_name="%(class)s_modified"
        )

        class Meta:
            abstract = True


class Company(AuditMixin):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    proprietor_name = models.CharField(max_length=200, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    telephone = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
