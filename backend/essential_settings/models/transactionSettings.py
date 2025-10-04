# backend/essential_settings/models/transaction_settings.py
from django.db import models
from backend.mixins import AuditMixin
from company.models.factory import Factory


class TransactionSetting(AuditMixin):
    factory = models.ForeignKey(
        Factory,
        on_delete=models.CASCADE,
        related_name="transaction_settings",
        null=True, blank=True
    )
    session = models.PositiveIntegerField(null=True, blank=True)

    party_transaction = models.CharField(max_length=16, default="Yes")

    advance_carrying_payment = models.CharField(max_length=16, default="Yes")
    advance_carrying_receive = models.CharField(max_length=16, default="Yes")
    advance_carrying_interest_receive = models.CharField(max_length=16, default="No")
    advance_ebag_amount_receive = models.CharField(max_length=16, default="Yes")
    advance_ebag_amount_interest_receive = models.CharField(max_length=16, default="No")
    advance_loan_payment = models.CharField(max_length=16, default="Yes")
    advance_loan_receive = models.CharField(max_length=16, default="Yes")
    advance_loan_interest_receive = models.CharField(max_length=16, default="Yes")

    sr_carrying_payment = models.CharField(max_length=16, default="Yes")
    sr_carrying_receive = models.CharField(max_length=16, default="Yes")
    sr_carrying_interest_receive = models.CharField(max_length=16, default="No")
    sr_ebag_amount_payment = models.CharField(max_length=16, default="Yes")
    sr_ebag_amount_receive = models.CharField(max_length=16, default="Yes")
    sr_ebag_amount_interest_receive = models.CharField(max_length=16, default="No")
    sr_loan_payment = models.CharField(max_length=16, default="Yes")
    sr_loan_receive = models.CharField(max_length=16, default="Yes")
    sr_loan_interest_receive = models.CharField(max_length=16, default="Yes")

    delivery_transaction = models.CharField(max_length=16, default="Yes")

    key = models.CharField(max_length=32, null=True, blank=True)

    def __str__(self):
        return f"TransactionSetting ({self.session}) - {self.factory}"
    
