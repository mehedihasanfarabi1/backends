from django.db import models
from django.db.models import Max
from backend.mixins import AuditMixin
from pallot.models.pallotType import PallotType
from pallot.models.pallotLocation import Chamber, Floor, Pocket
from sr.models.sr import SR


class Pallot(AuditMixin):
    pallot_type = models.ForeignKey(
        PallotType,
        on_delete=models.CASCADE,
        related_name="pallots",
        blank=True,
        null=True,
        default=None
    )
    date = models.DateField()
    sr = models.ForeignKey(
        SR,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        default=None,
        related_name="pallots"
    )
    pallot_number = models.PositiveBigIntegerField(
        unique=True,
        editable=True   # form থেকে দিতে পারবে
    )
    sr_quantity = models.PositiveIntegerField(default=0)
    comment = models.CharField(max_length=255, blank=True, null=True)

    chamber = models.ForeignKey(
        Chamber,
        on_delete=models.CASCADE,
        related_name="pallots",
        blank=True,
        null=True,
        default=None
    )
    floor = models.ForeignKey(
        Floor,
        on_delete=models.CASCADE,
        related_name="pallots",
        blank=True,
        null=True,
        default=None
    )
    pocket = models.ForeignKey(
        Pocket,
        on_delete=models.CASCADE,
        related_name="pallots",
        blank=True,
        null=True,
        default=None
    )
    quantity = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        # নতুন হলে auto increment, তবে user যদি number দেয় সেটা use হবে
        if not self.pk and not self.pallot_number:
            max_number = Pallot.objects.aggregate(Max("pallot_number"))["pallot_number__max"] or 0
            self.pallot_number = max_number + 1

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Pallot #{self.pallot_number}"
