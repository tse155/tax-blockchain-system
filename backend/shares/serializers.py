from rest_framework import serializers
from .models import CustomUser, Company, Share, Transfer


#! ////////////////////-----
#! Custom user serialization
#! //////////////////-------
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "password", "condition", "wallet_address"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # Extract password before creating user
        password = validated_data.pop("password")

        # Create user instance without password
        user = CustomUser.objects.create(**validated_data)

        # Set and hash the password properly
        user.set_password(password)

        # Ensure user is active
        user.is_active = True

        user.save()
        return user


#! ////////////////////-----
#! Ccompany serialization
#! //////////////////-------
class CompanySerializer(serializers.ModelSerializer):
    # Serializer for the Note Model we created
    new_vpp = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "registration_number",
            "created_at",
            "incorporator",
            "equity",
            "total_shares",
            "net_assets",
            "net_liabilities",
            "other_equity",
            "retained_earnings",
            "contract_address",
            "deployment_tx_hash",
            "new_vpp",
        ]
        # Allowed to read who the author is but not to write who the author is
        # The backend will decide&determine who the author should be
        read_only_fields = ["incorporator"]

    def get_new_vpp(self, obj):
        """Call the model method"""
        return obj.calculate_vpp()


#! ////////////////////-----
#! Share serialization
#! //////////////////-------
class ShareSerializer(serializers.ModelSerializer):
    # Read-only computed fields
    tax_deductible_base = serializers.SerializerMethodField()
    shareholder_wallet = serializers.SerializerMethodField()
    shareholder_wallet = serializers.SerializerMethodField()

    # Related object details (read-only)
    shareholder_name = serializers.CharField(
        source="shareholder.username", read_only=True
    )
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Share
        fields = [
            "id",
            "company",
            "company_name",
            "shareholder",
            "shareholder_name",
            "share_number",
            "share_vpp",
            "acquisition_price",
            "nominal_value",
            "acquisition_date",
            "token_id",
            "minting_tx_hash",
            "tax_deductible_base",
            "minting_timestamp",
            "shareholder_wallet",
        ]
        # read_only_fields = ["token_id", "minting_tx_hash"]

    def get_tax_deductible_base(self, obj):
        """Call the model method"""
        return obj.get_tax_deductible_base()

    def get_shareholder_wallet(self, obj):
        """Call the model method"""
        return obj.get_shareholder_wallet()

    def get_formatted_share_number(self, obj):
        return obj.get_formatted_share_number()


#! ////////////////////-----
#! Transfer serialization
#! //////////////////-------


class TransferSerializer(serializers.ModelSerializer):
    # Computed fields
    capital_gain_info = serializers.SerializerMethodField()

    # Related object details (read-only)
    from_shareholder_name = serializers.CharField(
        source="from_shareholder.username", read_only=True
    )
    to_shareholder_name = serializers.CharField(
        source="to_shareholder.username", read_only=True
    )
    share_number = serializers.IntegerField(source="share.share_number", read_only=True)
    formatted_share_number = serializers.CharField(
        source="share.get_formatted_share_number", read_only=True
    )
    company_name = serializers.CharField(source="share.company.name", read_only=True)

    class Meta:
        model = Transfer
        fields = [
            "id",
            "share",
            "share_number",
            "formatted_share_number",
            "company_name",
            "from_shareholder",
            "from_shareholder_name",
            "to_shareholder",
            "to_shareholder_name",
            "transfer_date",
            "transfer_price",
            "cost_basis_at_transfer",
            "status",
            "blockchain_tx_hash",
            "blockchain_timestamp",
            "capital_gain_info",
            "created_at",
        ]
        read_only_fields = [
            "from_shareholder",
            "transfer_date",
            "created_at",
            "cost_basis_at_transfer",
        ]

    def get_capital_gain_info(self, obj):
        """Call the model method to calculate tax info"""
        return obj.calculate_capital_gain()

    def validate(self, data):
        """Ensure from_shareholder actually owns the share"""
        share = data.get("share")
        from_shareholder = data.get("from_shareholder")

        if share and from_shareholder:
            if share.shareholder != from_shareholder:
                raise serializers.ValidationError(
                    f"{from_shareholder.username} does not own share #{share.share_number}"
                )

        return data
