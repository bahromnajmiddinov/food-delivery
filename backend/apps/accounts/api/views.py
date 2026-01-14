from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.utils.crypto import get_random_string
from apps.accounts.models import User, OTP, DeliveryAddress, DriverProfile
from apps.accounts.api.serializers import UserSerializer, OTPSerializer, DeliveryAddressSerializer, DriverProfileSerializer
import random


class SendOTPView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = OTPSerializer
    
    def post(self, request, *args, **kwargs):
        phone = request.data.get('phone')
        
        if not phone:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate OTP code
        otp_code = str(random.randint(100000, 999999))
        
        # Delete any existing OTP for this phone
        OTP.objects.filter(phone=phone).delete()
        
        # Create new OTP
        otp = OTP.objects.create(phone=phone, code=otp_code)
        
        # In production, you would send the OTP via SMS here
        print(f"OTP for {phone}: {otp_code}")
        
        return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)


class VerifyOTPView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = OTPSerializer
    
    def post(self, request, *args, **kwargs):
        phone = request.data.get('phone')
        code = request.data.get('code')
        name = request.data.get('name')
        role = request.data.get('role', 'customer')
        
        if not phone or not code:
            return Response({'error': 'Phone and OTP code are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            otp = OTP.objects.get(phone=phone, code=code)
            
            if otp.is_verified:
                return Response({'error': 'OTP already used'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user exists
            user, created = User.objects.get_or_create(phone=phone)
            
            if created:
                # Set user details for new users
                if name:
                    name_parts = name.split(' ', 1)
                    user.first_name = name_parts[0]
                    user.last_name = name_parts[1] if len(name_parts) > 1 else ''
                user.role = role
                user.save()
            
            # Mark OTP as verified
            otp.is_verified = True
            otp.save()
            
            # Create or get auth token
            token, _ = Token.objects.get_or_create(user=user)
            
            # Serialize user
            serializer = UserSerializer(user)
            
            return Response({
                'token': token.key,
                'user': serializer.data
            }, status=status.HTTP_200_OK)
            
        except OTP.DoesNotExist:
            return Response({'error': 'Invalid OTP code'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


class DeliveryAddressListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DeliveryAddressSerializer
    
    def get_queryset(self):
        return DeliveryAddress.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DeliveryAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DeliveryAddressSerializer
    
    def get_queryset(self):
        return DeliveryAddress.objects.filter(user=self.request.user)


class RecentAddressesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DeliveryAddressSerializer
    
    def get_queryset(self):
        return DeliveryAddress.objects.filter(user=self.request.user, is_recent=True).order_by('-updated_at')[:5]


class SavedAddressesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DeliveryAddressSerializer
    
    def get_queryset(self):
        return DeliveryAddress.objects.filter(user=self.request.user, is_saved=True)


class DriverProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DriverProfileSerializer
    
    def get_object(self):
        try:
            return self.request.user.driver_profile
        except DriverProfile.DoesNotExist:
            return DriverProfile.objects.create(user=self.request.user)