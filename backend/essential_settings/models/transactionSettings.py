# backend/essential_settings/models/transaction_settings.py
from django.db import models
from backend.mixins import AuditMixin
from company.models.factory import Factory
import uuid
import datetime

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
    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_unique_key()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_unique_key():

        from essential_settings.models.transactionSettings import TransactionSetting
        while True:
            
            uuid_part = str(uuid.uuid4().int % 10**6).zfill(6)
            
            sec_part = str(datetime.datetime.now().second).zfill(2)
            key = uuid_part + sec_part 

            if not TransactionSetting.objects.filter(key=key).exists():
                return key

    def __str__(self):
        return f"TransactionSetting ({self.session}) - {self.factory}"
    
