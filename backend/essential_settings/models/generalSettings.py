# backend/essential_settings/models/general_settings.py
from django.db import models
from backend.mixins import AuditMixin
from company.models.factory import Factory


class GeneralSetting(AuditMixin):
    factory = models.ForeignKey(
        Factory,
        on_delete=models.CASCADE,
        related_name="general_settings",
        null=True, blank=True
    )
    author = models.CharField(max_length=50, null=True, blank=True)
    author_email = models.EmailField(max_length=100, null=True, blank=True)
    author_phone = models.CharField(max_length=15, null=True, blank=True)
    author_mobile = models.CharField(max_length=15, null=True, blank=True)
    author_address = models.TextField(null=True, blank=True)

    title = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    contact = models.TextField(null=True, blank=True)
    other_contacts = models.TextField(null=True, blank=True)
    tag = models.TextField(null=True, blank=True)

    loan_payment_form = models.CharField(
        max_length=10,
        choices=[("Single", "Single"), ("Multiple", "Multiple")],
        default="Multiple"
    )
    loan_receive_form = models.CharField(
        max_length=10,
        choices=[("Single", "Single"), ("Multiple", "Multiple")],
        default="Single"
    )
    delivery_form = models.CharField(
        max_length=10,
        choices=[("Single", "Single"), ("Multiple", "Multiple")],
        default="Single"
    )

    sendmail = models.BooleanField(default=False)
    sendsms = models.BooleanField(default=False)

    page_size = models.IntegerField(null=True, blank=True)
    currency = models.CharField(max_length=10, null=True, blank=True)
    theme = models.CharField(max_length=20, null=True, blank=True)
    language = models.CharField(max_length=10, null=True, blank=True)
    timezone = models.CharField(max_length=30, null=True, blank=True)

    favicon = models.CharField(max_length=32, null=True, blank=True)
    logo = models.CharField(max_length=32, null=True, blank=True)
    screen_saver = models.CharField(max_length=32, null=True, blank=True)

    key = models.CharField(max_length=32, null=True, blank=True)

    class Meta:
        db_table = "general_setting"
        verbose_name = "General Setting"
        verbose_name_plural = "General Settings"

    def __str__(self):
        return f"GeneralSetting ({self.title}) - {self.factory}"
