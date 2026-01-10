from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from apps.restaurants.models import Restaurant, MenuItem
from apps.restaurants.api.serializers import RestaurantSerializer, MenuItemSerializer


class RestaurantListView(generics.ListAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'tags__name']
    ordering_fields = ['rating', 'delivery_time']


class RestaurantDetailView(generics.RetrieveAPIView):
    queryset = Restaurant.objects.all()
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
        return Restaurant.objects.all().order_by('-rating')[:10]