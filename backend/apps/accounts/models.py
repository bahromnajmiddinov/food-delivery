from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from apps.common.models import BaseModel


class UserRole(models.TextChoices):
    CUSTOMER = 'customer', _('Customer')
    DRIVER = 'driver', _('Driver')
    KITCHEN_STAFF = 'kitchen_staff', _('Kitchen Staff')


class CustomUserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError('The Phone number must be set')
        
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(phone, password, **extra_fields)


class User(AbstractUser, BaseModel):
    username = None
    phone = models.CharField(max_length=20, unique=True, verbose_name='Phone Number')
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER
    )
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    rating = models.FloatField(null=True, blank=True)
    
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []
    
    objects = CustomUserManager()
    
    def __str__(self):
        return f"{self.name} ({self.phone}) - {self.role}"
    
    @property
    def name(self):
        return f"{self.first_name} {self.last_name}".strip()


class OTP(models.Model):
    phone = models.CharField(max_length=20)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"OTP for {self.phone}"


class DeliveryAddress(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=100)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    is_saved = models.BooleanField(default=False)
    is_recent = models.BooleanField(default=False)
    
    class Meta:
        verbose_name_plural = 'Delivery Addresses'
    
    def __str__(self):
        return f"{self.label} - {self.address}"


class DriverProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    vehicle_type = models.CharField(max_length=50)
    vehicle_brand = models.CharField(max_length=50)
    vehicle_model = models.CharField(max_length=50)
    plate_number = models.CharField(max_length=20)
    color = models.CharField(max_length=30)
    
    def __str__(self):
        return f"Driver: {self.user.name}"