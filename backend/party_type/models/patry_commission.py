from django.db import models
from backend.mixins import AuditMixin
from party_type.models.party_type import PartyType
from party_type.models.party import Party
from products.models.category import Category
from products.models.product import Product
from products.models.unit import Unit
from products.models.unitSize import UnitSize

class PartyCommission(AuditMixin):
    party_type = models.ForeignKey(
        PartyType,
        on_delete=models.CASCADE,
        related_name="party_commissions",
        blank=True,
        null=True,
        default=None
    )
    party = models.ForeignKey(
        Party,
        on_delete=models.CASCADE,
        related_name="party_commissions",
        blank=True,
        null=True,
        default=None
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="party_commissions",
        blank=True,
        null=True,
        default=None
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="party_commissions",
        blank=True,
        null=True,
        default=None
    )
    unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        related_name="party_commissions",
        blank=True,
        null=True,
        default=None
    )
    unit_size = models.ForeignKey(
        UnitSize,
        on_delete=models.CASCADE,
        related_name="party_commissions",
        blank=True,
        null=True,
        default=None
    )
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00,blank=True,null=True)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00,blank=True,null=True)

    def __str__(self):
        party_name = self.party.name if self.party else "No Party"
        product_name = self.product.name if self.product else "No Product"
        return f"{party_name} - {product_name} - {self.commission_percentage or 0}%"
