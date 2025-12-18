from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


# Create your models here.
#! ////////////////////-----
#! Custom user creation
#! //////////////////-------
class CustomUser(AbstractUser):
    STATUS = [
        ("shareholder", "shareholder"),
        ("authority", "authority"),
    ]
    condition = models.CharField(max_length=100, choices=STATUS, default="shareholder")
    wallet_address = models.CharField(
        max_length=42,
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.username


#! ////////////////////-----
#! Company model
#! //////////////////-------


class Company(models.Model):
    name = models.CharField(max_length=255)
    registration_number = models.CharField(
        max_length=13, unique=True, default="1717241717001"
    )
    # Company details
    created_at = models.DateTimeField(auto_now_add=True)
    incorporator = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="companies"
    )
    # Equity related information
    equity = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)  # type: ignore
    total_shares = models.IntegerField()
    # Financial-related information
    net_assets = models.DecimalField(max_digits=15, decimal_places=2)
    net_liabilities = models.DecimalField(max_digits=15, decimal_places=2)
    other_equity = models.DecimalField(max_digits=15, decimal_places=2)
    retained_earnings = models.DecimalField(max_digits=15, decimal_places=2)
    # blockchain related information
    contract_address = models.CharField(
        max_length=42,
        blank=True,
        null=True,
    )
    deployment_tx_hash = models.CharField(
        max_length=66,
        blank=True,
        null=True,
        help_text="Transaction hash of contract deployment",
    )

    def __str__(self):
        return f"{self.name} (Reg: {self.registration_number}) - {self.total_shares} shares"

    def calculate_vpp(self):
        """
        Calculate VPP (Valor Patrimonial Proporcional)
        VPP = Total Equity / Total Shares

        Where Total Equity = Net Assets - Net Liabilities + Other Equity + Retained Earnings
        """
        total_equity = (
            float(self.net_assets)
            - float(self.net_liabilities)
            + float(self.other_equity)
            - float(self.retained_earnings)
        )

        if self.total_shares > 0:
            vpp = total_equity / self.total_shares
            return vpp
        return 0.00

    def get_total_shares_issued(self):
        """Count actual shares issued (in Share table)"""
        return self.total_shares


#! ////////////////////-----
#! Share model
#! //////////////////-------
class Share(models.Model):
    # Core relationships
    company = models.ForeignKey(
        "Company", on_delete=models.CASCADE, related_name="shares"
    )
    shareholder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shares",
        limit_choices_to={"condition": "shareholder"},
    )

    # Simple integer counter (display formatted in frontend)
    share_number = models.IntegerField(help_text="Share number (e.g., 1, 2, 3...)")

    # Tax-relevant values (per share)
    share_vpp = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Valor Patrimonial Proporcional (VPP) - Book value",
    )
    acquisition_price = models.DecimalField(
        max_digits=15, decimal_places=2, help_text="Actual acquisition cost/price paid"
    )
    nominal_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=1.00,  # type: ignore
        help_text="Nominal/par value (typically USD $1.00)",
    )

    # Dates
    acquisition_date = models.DateField(auto_now_add=True)

    # Blockchain fields
    token_id = models.IntegerField(
        null=True, blank=True, help_text="NFT token ID (usually same as share_number)"
    )

    minting_tx_hash = models.CharField(
        max_length=66, blank=True, null=True, help_text="Transaction hash of minting"
    )

    minting_timestamp = models.BigIntegerField(
        null=True, blank=True, help_text="Block timestamp when minted"
    )

    shareholder_wallet = models.CharField(
        max_length=42,
        blank=True,
        null=True,
        help_text="Shareholder's Ethereum wallet address",
    )

    class Meta:
        unique_together = ["company", "share_number"]
        ordering = ["company", "share_number"]

    def __str__(self):
        return f"{self.company.name} - {self.share_number} (Owner: {self.shareholder.username})"

    def get_formatted_share_number(self):
        """Returns formatted share number like 'CERT-001'"""
        return f"CERT-{self.share_number:03d}"

    def get_tax_deductible_base(self):
        """
        Per Ecuadorian tax law: Largest of acquisition price, nominal value, or VPP
        This is the tax-deductible base for capital gains calculation
        """
        return max(
            float(self.acquisition_price),
            float(self.nominal_value),
            float(self.share_vpp),
        )

    def get_shareholder_wallet(self):
        """Helper to access shareholder's wallet address"""
        return (
            self.shareholder.wallet_address if self.shareholder.wallet_address else None
        )


#! ////////////////////-----
#! Transfer model
#! //////////////////-------


class Transfer(models.Model):
    # Core relationships
    share = models.ForeignKey(
        "Share", on_delete=models.CASCADE, related_name="transfers"
    )
    from_shareholder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transfers_sent",
    )
    to_shareholder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transfers_received",
    )

    # Transfer details
    transfer_date = models.DateField(auto_now_add=True)
    transfer_price = models.DecimalField(
        max_digits=15, decimal_places=2, help_text="Sale price per share"
    )

    # ← NEW: Snapshot cost basis at transfer time
    cost_basis_at_transfer = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Tax deductible base captured at time of transfer (immutable)",
    )

    # Status
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("rejected", "Rejected"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # Blockchain
    # ADD THIS:
    blockchain_tx_hash = models.CharField(
        max_length=66,
        blank=True,
        null=True,
        help_text="Transaction hash of blockchain transfer",
    )

    blockchain_timestamp = models.BigIntegerField(
        null=True, blank=True, help_text="Block timestamp of transfer"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Transfer #{self.id}: Share #{self.share.share_number} | {self.from_shareholder.username} → {self.to_shareholder.username}"  # type:ignore

    def calculate_capital_gain(self):
        """
        Calculate capital gain using STORED cost basis
        (captured at time of transfer, not current share value)
        """
        # Use stored cost basis if available, otherwise calculate from current share
        sale_price = float(self.transfer_price)

        if self.cost_basis_at_transfer:
            cost_basis = float(self.cost_basis_at_transfer)
        else:
            cost_basis = self.share.get_tax_deductible_base()

        capital_gain = sale_price - cost_basis
        return {
            "cost_basis": cost_basis,
            "sale_price": float(self.transfer_price),
            "capital_gain": capital_gain,
            "taxable_amount": max(capital_gain, 0),
            "tax_rate": 0.10,
            "tax_owed": max(capital_gain, 0) * 0.10,
        }

    def save(self, *args, **kwargs):
        """
        Override save to:
        1. Capture cost basis BEFORE updating share
        2. Update share ownership when completed
        """
        is_new = self.pk is None
        old_status = None

        if not is_new:
            old_transfer = Transfer.objects.get(pk=self.pk)
            old_status = old_transfer.status

        # If status is changing to completed, capture cost basis NOW (before share updates)
        if self.status == "completed" and old_status != "completed":
            # ← CAPTURE COST BASIS BEFORE UPDATING SHARE!
            if not self.cost_basis_at_transfer:
                self.cost_basis_at_transfer = self.share.get_tax_deductible_base()

        # Save the transfer first
        super().save(*args, **kwargs)

        # NOW update the share (after cost basis is captured)
        if self.status == "completed" and old_status != "completed":
            self.share.shareholder = self.to_shareholder
            self.share.acquisition_date = self.transfer_date
            self.share.acquisition_price = (
                self.transfer_price
            )  # ← Updates AFTER snapshot
            self.share.save()
