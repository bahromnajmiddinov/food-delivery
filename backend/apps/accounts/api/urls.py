from django.urls import path
from apps.accounts.api.views import (
    SendOTPView,
    VerifyOTPView,
    UserProfileView,
    DeliveryAddressListCreateView,
    DeliveryAddressDetailView,
    RecentAddressesView,
    SavedAddressesView,
    DriverProfileView
)

urlpatterns = [
    path('auth/send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('addresses/', DeliveryAddressListCreateView.as_view(), name='address-list'),
    path('addresses/<int:pk>/', DeliveryAddressDetailView.as_view(), name='address-detail'),
    path('addresses/recent/', RecentAddressesView.as_view(), name='recent-addresses'),
    path('addresses/saved/', SavedAddressesView.as_view(), name='saved-addresses'),
    path('driver-profile/', DriverProfileView.as_view(), name='driver-profile'),
]