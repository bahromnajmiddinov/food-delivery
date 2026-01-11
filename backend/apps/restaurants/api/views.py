from rest_framework import generics, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from apps.restaurants.models import Restaurant, MenuItem, KitchenStaff
from apps.restaurants.api.serializers import RestaurantSerializer, MenuItemSerializer, KitchenStaffSerializer
from apps.orders.api.serializers import OrderSerializer


class RestaurantListView(generics.ListAPIView):
    queryset = Restaurant.objects.filter(is_active=True)
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'tags__name']
    ordering_fields = ['rating', 'delivery_time']


class RestaurantDetailView(generics.RetrieveAPIView):
    queryset = Restaurant.objects.filter(is_active=True)
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]


class MenuItemListView(generics.ListAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        restaurant_id = self.kwargs.get('restaurant_id')
        return MenuItem.objects.filter(restaurant_id=restaurant_id)


class MenuItemDetailView(generics.RetrieveAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]


class PopularRestaurantsView(generics.ListAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Restaurant.objects.filter(is_active=True).order_by('-rating')[:10]


class KitchenStaffListCreateView(generics.ListCreateAPIView):
    serializer_class = KitchenStaffSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Only restaurant managers or admins can see all kitchen staff
        if user.is_superuser or (hasattr(user, 'kitchen_staff_profile') and user.kitchen_staff_profile.position == 'manager'):
            return KitchenStaff.objects.all()
        
        # Regular kitchen staff can only see themselves
        return KitchenStaff.objects.filter(user=user)
    
    def perform_create(self, serializer):
        # Only managers or admins can create kitchen staff
        user = self.request.user
        if not (user.is_superuser or (hasattr(user, 'kitchen_staff_profile') and user.kitchen_staff_profile.position == 'manager')):
            raise PermissionError("Only managers can create kitchen staff")
        
        serializer.save()


class KitchenStaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = KitchenStaffSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admins can see all kitchen staff
        if user.is_superuser:
            return KitchenStaff.objects.all()
        
        # Managers can see staff in their restaurant
        if hasattr(user, 'kitchen_staff_profile') and user.kitchen_staff_profile.position == 'manager':
            return KitchenStaff.objects.filter(restaurant=user.kitchen_staff_profile.restaurant)
        
        # Regular staff can only see themselves
        return KitchenStaff.objects.filter(user=user)


class MyRestaurantOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Get the restaurant where this kitchen staff works
        try:
            kitchen_staff = user.kitchen_staff_profile
            return Order.objects.filter(restaurant=kitchen_staff.restaurant).order_by('-created_at')
        except KitchenStaff.DoesNotExist:
            return Order.objects.none()