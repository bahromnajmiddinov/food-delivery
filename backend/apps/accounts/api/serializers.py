from rest_framework import serializers
from apps.accounts.models import User, OTP, DeliveryAddress, DriverProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone', 'first_name', 'last_name', 'name', 'role', 'avatar', 'rating']
        read_only_fields = ['id', 'name']


class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ['phone', 'code']


class DeliveryAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryAddress
        fields = ['id', 'user', 'label', 'address', 'latitude', 'longitude', 'is_saved', 'is_recent']
        read_only_fields = ['id', 'user']


class DriverProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverProfile
        fields = ['id', 'user', 'vehicle_type', 'vehicle_brand', 'vehicle_model', 'plate_number', 'color']
        read_only_fields = ['id', 'user']