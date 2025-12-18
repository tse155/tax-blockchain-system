from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import CustomUser, Company, Share, Transfer
from .serializers import (
    CustomUserSerializer,
    CompanySerializer,
    ShareSerializer,
    TransferSerializer,
)


# Create your views here.
#! ////////////////////-----
#! CustomUser view
#! //////////////////-------
class CreateCustomUser(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]


class UserDetailsView(APIView):
    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)


class AllUsersDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = CustomUser.objects.all()  # ← Get all users
        serializer = CustomUserSerializer(users, many=True)  # ← Pass data + many=True
        return Response(serializer.data)


#! ////////////////////-----
#! Company related views
#! //////////////////-------
class CompanyCreate(generics.ListCreateAPIView):
    # List api view -> both get and post. We can create *post* a note and retrieve the notes
    serializer_class = CompanySerializer
    # from rest_frameworks and permissions we check whether the user is authenticated if it has a valid
    # JWT token
    permission_classes = [IsAuthenticated]

    # function to list related Notes
    def get_queryset(self):
        # the authenticated user can be retrieved from the following:
        # user = self.request.user
        # for querying all notes -> Note.objects.all()
        # for querying notes related to the specific user:
        return Company.objects
        # .filter(incorporator=user)

    # function to create a note
    def perform_create(self, serializer):
        # validation logic is commented out,it may be not required since validation happens
        # when we are calling the view that triggers validation by the serializer object we created

        # if serializer.is_valid():
        # author is passed manually since in the serializer it was read_only
        # So, in contrast with other datafields it will not be passed automatically
        serializer.save(incorporator=self.request.user)


class CompanyDelete(generics.DestroyAPIView):
    serializer = CompanySerializer
    permission_classes = [IsAuthenticated]

    # query_set of the notes we are allowed to delete are simply those define in accordance to the function
    def get_queryset(self):
        user = self.request.user
        return Company.objects.filter(incorporator=user)


class CompanyUpdateView(generics.UpdateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.condition == "authority" or user.is_superuser:  # type: ignore
            return Company.objects.all()
        return Company.objects.filter(incorporator=user)

    def perform_update(self, serializer):
        """After updating company, recalculate VPP for all shares"""
        company = serializer.save()
        return company


class CompanyCalculateVPPView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """
        Calculate VPP for a company
        GET /api/company/<id>/calculate-vpp/
        """
        company = Company.objects.get(pk=pk)

        # Calculate and update VPP
        new_vpp = company.calculate_vpp()  # ← Calls model method

        return Response(
            {
                "message": "VPP updated successfully",
                "new_vpp": new_vpp,
                "company": CompanySerializer(company).data,
            }
        )


#! ////////////////////-----
#! Share related views
#! //////////////////-------
# Individual share creation
class ShareCreateView(generics.CreateAPIView):
    serializer_class = ShareSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set shareholder to current user if not specified
        if "shareholder" not in self.request.data:  # type: ignore
            serializer.save(shareholder=self.request.user)
        else:
            serializer.save()


# List shares (filtered by user role)
class ShareListView(generics.ListAPIView):
    serializer_class = ShareSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Authority sees everything
        if user.condition == "authority" or user.is_superuser:  # type: ignore
            return Share.objects.all()

        # Shareholder sees only their own shares
        elif user.condition == "shareholder":  # type: ignore
            return Share.objects.filter(shareholder=user)

        return Share.objects.none()

    # List shares (filtered by user role)


class SpecialShareListView(generics.ListAPIView):
    serializer_class = ShareSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Share.objects.all()


# Bulk share creation (optional - for efficiency)
class BulkShareCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Create multiple shares at once
        Initial issuance defaults acquisition_price to nominal value
        """
        company_id = request.data.get("company_id")
        quantity = int(request.data.get("quantity"))
        share_vpp = request.data.get("share_vpp")
        nominal_value = request.data.get("nominal_value", 1.00)

        # For initial issuance, acquisition price = nominal value
        acquisition_price = request.data.get("acquisition_price", nominal_value)

        company = Company.objects.get(id=company_id)
        shareholder = request.user

        # Find starting share number
        last_share = (
            Share.objects.filter(company=company).order_by("-share_number").first()
        )
        start_num = (last_share.share_number + 1) if last_share else 1

        # Create shares
        shares = []
        for i in range(start_num, start_num + quantity):
            share = Share(
                company=company,
                shareholder=shareholder,
                share_number=i,
                share_vpp=share_vpp,
                acquisition_price=acquisition_price,  # Defaults to $1.00
                nominal_value=nominal_value,
            )
            shares.append(share)

        Share.objects.bulk_create(shares)

        return Response(
            {
                "message": f"Successfully created {len(shares)} shares",
                "created": len(shares),
                "share_range": f"#{start_num} to #{start_num + quantity - 1}",
                "acquisition_price": float(acquisition_price),
            },
            status=status.HTTP_201_CREATED,
        )


class ShareUpdateView(generics.UpdateAPIView):
    """
    Update an existing share (for blockchain data)
    """

    serializer_class = ShareSerializer
    permission_classes = [IsAuthenticated]
    queryset = Share.objects.all()

    def get_queryset(self):
        # Allow updating shares you own OR shares in companies you own
        user = self.request.user
        return Share.objects.filter(Q(shareholder=user) | Q(company__incorporator=user))


#! ////////////////////-----
#! Share related views
#! //////////////////-------
class TransferListView(generics.ListAPIView):
    serializer_class = TransferSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Authority sees everything
        if user.condition == "authority" or user.is_superuser:  # type: ignore
            return Transfer.objects.all()

        # Shareholders see transfers they're involved in
        elif user.condition == "shareholder":  # type: ignore
            return Transfer.objects.filter(
                Q(from_shareholder=user) | Q(to_shareholder=user)
            )

        return Transfer.objects.none()


# Create transfer
class TransferCreateView(generics.CreateAPIView):
    serializer_class = TransferSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set from_shareholder to current user
        serializer.save(from_shareholder=self.request.user)


# Update transfer status (complete/reject)
class TransferUpdateView(generics.UpdateAPIView):
    serializer_class = TransferSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Authority can update any transfer
        if user.condition == "authority" or user.is_superuser:  # type: ignore
            return Transfer.objects.all()

        # Shareholders can only update their own transfers
        return Transfer.objects.filter(from_shareholder=user)


# Complete transfer (shortcut endpoint)
class TransferCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        Mark transfer as completed
        POST /api/transfers/<id>/complete/
        """
        try:
            transfer = Transfer.objects.get(pk=pk)
        except Transfer.DoesNotExist:
            return Response(
                {"error": "Transfer not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check permissions
        user = request.user
        if user.condition not in ["authority"] and transfer.from_shareholder != user:
            return Response(
                {"error": "You don't have permission to complete this transfer"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Mark as completed (triggers share ownership update)
        transfer.status = "completed"
        transfer.save()

        # Calculate tax info
        tax_info = transfer.calculate_capital_gain()

        return Response(
            {
                "message": "Transfer completed successfully",
                "transfer": TransferSerializer(transfer).data,
                "tax_calculation": tax_info,
            }
        )
