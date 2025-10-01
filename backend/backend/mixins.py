# backend/backend/mixins.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError


# -------------------------------
# 🔹 Soft Delete Manager & Queryset
# -------------------------------
class SoftDeleteQuerySet(models.QuerySet):
    def alive(self):
        return self.filter(is_deleted=False)

    def deleted(self):
        return self.filter(is_deleted=True)


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        # Default → শুধু alive data রিটার্ন করবে
        return SoftDeleteQuerySet(self.model, using=self._db).alive()

    def all_with_deleted(self):
        # সব data (deleted সহ)
        return SoftDeleteQuerySet(self.model, using=self._db).all()

    def only_deleted(self):
        # শুধু deleted data
        return SoftDeleteQuerySet(self.model, using=self._db).deleted()


# -------------------------------
# 🔹 Audit + Soft Delete Base Mixin
# -------------------------------
class AuditMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="%(class)s_created"
    )
    modified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="%(class)s_modified"
    )

    ip_address = models.GenericIPAddressField(null=True, blank=True)  # user IP
    browser_info = models.CharField(max_length=255, null=True, blank=True)  # user browser

    # 🔹 Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="%(class)s_deleted"
    )
        # Manager attach
    objects = SoftDeleteManager()       # Default → alive data only
    all_objects = models.Manager()      # সব data (deleted সহ)

    class Meta:
        abstract = True

    # 🔹 Soft delete method

    def delete(self, using=None, keep_parents=False, user=None):
        """
        Override delete → soft delete only.
        If child exists (not deleted), block delete.
        """
        for rel in self._meta.related_objects:
            accessor = rel.get_accessor_name()
            related_qs = getattr(self, accessor).all()

            # child model এ যদি AuditMixin থাকে (is_deleted field থাকে) → তখন চেক করবো
            if hasattr(related_qs, "filter") and related_qs.filter(is_deleted=False).exists():
                # 🔹 DRF-friendly exception
                raise DRFValidationError("You need to delete child records first.")

        self.is_deleted = True
        self.deleted_at = timezone.now()
        if user:
            self.deleted_by = user
        self.save(update_fields=["is_deleted", "deleted_at", "deleted_by"])


    # 🔹 Hard delete (database থেকে একেবারে মুছে ফেলা)
    def hard_delete(self, using=None, keep_parents=False):
        return super().delete(using=using, keep_parents=keep_parents)