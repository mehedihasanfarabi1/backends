from django.db import models
from backend.mixins import AuditMixin
from .unit import Unit

class UnitConversion(AuditMixin):
    company = models.ForeignKey(
        "company.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_company",
        default=""
    )
    business_type = models.ForeignKey(
        "company.BusinessType",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_business_type",
        default=""
    )
    factory = models.ForeignKey(
        "company.Factory",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_factory",
        default=""
    )
    parent_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name="parent_conversions")
    child_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name="child_conversions")
    qty = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"1 {self.parent_unit.short_name} = {self.qty} {self.child_unit.short_name}"
