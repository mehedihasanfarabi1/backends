# backend/essential_settings/models/basic_settings.py
from django.db import models
from backend.mixins import AuditMixin
from company.models.factory import Factory


class BasicSetting(AuditMixin):
    factory = models.ForeignKey(
        Factory,
        on_delete=models.CASCADE,
        related_name="basic_settings",
        null=True, blank=True
    )
    session = models.PositiveIntegerField(null=True, blank=True)  
    interest_rate = models.FloatField(null=True, blank=True)
    period = models.IntegerField(null=True, blank=True)
    min_day = models.IntegerField(null=True, blank=True)
    empty_bag_price = models.FloatField(null=True, blank=True)
    max_loan_per_qty = models.FloatField(null=True, blank=True)
    max_rent_per_qty = models.FloatField(null=True, blank=True)
    max_rent_per_kg = models.FloatField(null=True, blank=True)
    fan_charge = models.FloatField(null=True, blank=True)
    labour_charge = models.FloatField(null=True, blank=True)
    labour_charge_per_kg = models.FloatField(null=True, blank=True)
    agent_commission = models.FloatField(null=True, blank=True)

    ebag_count = models.CharField(
        max_length=3, choices=[("Yes", "Yes"), ("No", "No")], default="No"
    )
    carrying_count = models.CharField(
        max_length=3, choices=[("Yes", "Yes"), ("No", "No")], default="No"
    )

    carrying_interest_rate = models.FloatField(null=True, blank=True)
    interest_start_date = models.DateField(null=True, blank=True)
    transaction_date = models.DateField(null=True, blank=True)

    delivery_type = models.CharField(max_length=16, default="bag")
    less_weight = models.FloatField(null=True, blank=True)
    delivery_commission_rate = models.FloatField(null=True, blank=True)
    value_mode = models.CharField(max_length=16, default="floor")

    monthly_interest = models.TextField(null=True, blank=True)
    loantype_interest = models.TextField(null=True, blank=True)

    key = models.CharField(max_length=32, null=True, blank=True)

    class Meta:
        db_table = "basic_setting"
        verbose_name = "Basic Setting"
        verbose_name_plural = "Basic Settings"

    def __str__(self):
        return f"BasicSetting ({self.session}) - {self.factory}"
