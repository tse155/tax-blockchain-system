from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    # prebuilt views to handle token operations, acess and refresh tokens
    # tokens generates for user, for effecively signing in and maintaining session
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # User
    path("user/register/", views.CreateCustomUser.as_view(), name="register"),
    path("userdata/", views.UserDetailsView.as_view(), name="user"),
    path("alluserdata/", views.AllUsersDetailsView.as_view(), name="all-users"),
    # Auth
    path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    # Companies
    path("company/", views.CompanyCreate.as_view(), name="company"),
    path(
        "company/delete/<int:pk>/", views.CompanyDelete.as_view(), name="company_delete"
    ),
    path(
        "company/<int:pk>/update/",
        views.CompanyUpdateView.as_view(),
        name="company-update",
    ),
    path(
        "company/<int:pk>/calculate-vpp/",
        views.CompanyCalculateVPPView.as_view(),
        name="company-calculate-vpp",
    ),
    # Shares
    path("shares/", views.ShareListView.as_view(), name="share-list"),
    path("shares/special/", views.SpecialShareListView.as_view(), name="share-list-special"),
    path("shares/create/", views.ShareCreateView.as_view(), name="share-create"),
    path(
        "shares/bulk-create/",
        views.BulkShareCreateView.as_view(),
        name="share-bulk-create",
    ),
    path(
        "shares/<int:pk>/update/",  # ← ADD THIS!
        views.ShareUpdateView.as_view(),
        name="share-update",
    ),
    # Transfers
    path("transfers/", views.TransferListView.as_view(), name="transfer-list"),
    path(
        "transfers/create/", views.TransferCreateView.as_view(), name="transfer-create"
    ),
    path(
        "transfers/<int:pk>/update/",
        views.TransferUpdateView.as_view(),
        name="transfer-update",
    ),
    path(
        "transfers/<int:pk>/complete/",
        views.TransferCompleteView.as_view(),
        name="transfer-complete",
    ),
]
