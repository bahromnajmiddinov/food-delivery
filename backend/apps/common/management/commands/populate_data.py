from django.core.management.base import BaseCommand
from apps.accounts.models import User, DeliveryAddress, DriverProfile
from apps.restaurants.models import Restaurant, MenuItem, Tag
from apps.orders.models import Order, OrderItem, Review, Notification
from django.contrib.auth.hashers import make_password
import random


class Command(BaseCommand):
    help = 'Populates the database with test data'
    
    def handle(self, *args, **options):
        self.stdout.write('Starting data population...')
        
        # Create admin user
        admin, created = User.objects.get_or_create(
            phone='+1234567890',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'customer',
                'is_staff': True,
                'is_superuser': True,
                'password': make_password('admin123')
            }
        )
        if created:
            self.stdout.write('Created admin user')
        
        # Create test users
        users_data = [
            {'phone': '+19900000000', 'first_name': 'John', 'last_name': 'Doe', 'role': 'customer'},
            {'phone': '+19901111111', 'first_name': 'Jane', 'last_name': 'Smith', 'role': 'customer'},
            {'phone': '+180055501', 'first_name': 'Bob', 'last_name': 'Driver', 'role': 'driver'},
            {'phone': '+180055502', 'first_name': 'Eva', 'last_name': 'Rider', 'role': 'driver'},
            {'phone': '+1700123456', 'first_name': 'Chef', 'last_name': 'Kitchen', 'role': 'kitchen_staff'},
        ]
        
        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                phone=user_data['phone'],
                defaults={
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'role': user_data['role'],
                    'password': make_password('password123')
                }
            )
            users.append(user)
            if created:
                self.stdout.write(f'Created user: {user.name}')
        
        # Create driver profiles
        drivers = [user for user in users if user.role == 'driver']
        for driver in drivers:
            profile, created = DriverProfile.objects.get_or_create(
                user=driver,
                defaults={
                    'vehicle_type': 'Car',
                    'vehicle_brand': 'Toyota',
                    'vehicle_model': 'Corolla',
                    'plate_number': f'ABC{random.randint(100, 999)}',
                    'color': random.choice(['Red', 'Blue', 'Black', 'White', 'Silver'])
                }
            )
            if created:
                self.stdout.write(f'Created driver profile for {driver.name}')
        
        # Create restaurants
        restaurants_data = [
            {
                'name': 'KFC',
                'image': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800',
                'logo': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200',
                'rating': 4.5,
                'delivery_time': '45-55 min',
                'distance': '1.3 km',
                'latitude': 41.3035,
                'longitude': 69.2800
            },
            {
                'name': 'Yapona Mama',
                'image': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
                'logo': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200',
                'rating': 4.4,
                'delivery_time': '40-50 min',
                'distance': '2.1 km',
                'latitude': 41.3050,
                'longitude': 69.2850
            },
            {
                'name': 'Burger Embassy',
                'image': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
                'logo': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
                'rating': 4.4,
                'delivery_time': '45-55 min',
                'distance': '1.8 km',
                'latitude': 41.3070,
                'longitude': 69.2820
            },
            {
                'name': 'EVOS',
                'image': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
                'logo': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
                'rating': 4.6,
                'delivery_time': '40-50 min',
                'distance': '2.5 km',
                'latitude': 41.3005,
                'longitude': 69.2950
            },
            {
                'name': 'Gumma xonim',
                'image': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',
                'logo': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200',
                'rating': 4.3,
                'delivery_time': '95-105 min',
                'distance': '3.2 km',
                'latitude': 41.3150,
                'longitude': 69.3000
            },
        ]
        
        restaurants = []
        for restaurant_data in restaurants_data:
            restaurant, created = Restaurant.objects.get_or_create(
                name=restaurant_data['name'],
                defaults=restaurant_data
            )
            restaurants.append(restaurant)
            if created:
                self.stdout.write(f'Created restaurant: {restaurant.name}')
        
        # Create tags for restaurants
        tags_data = [
            ('KFC', ['Free delivery', '40% off select items']),
            ('Yapona Mama', ['30% off select items']),
            ('Burger Embassy', ['-40% on a number of dishes', '30% off select items']),
            ('EVOS', ['Free delivery']),
            ('Gumma xonim', ['Free delivery']),
        ]
        
        for restaurant_name, tag_names in tags_data:
            restaurant = next((r for r in restaurants if r.name == restaurant_name), None)
            if restaurant:
                for tag_name in tag_names:
                    Tag.objects.get_or_create(restaurant=restaurant, name=tag_name)
        
        # Create menu items
        menu_items_data = [
            {
                'restaurant': 'KFC',
                'name': 'Fried Chicken Bucket',
                'description': '8 pieces of crispy fried chicken',
                'price': 34.00,
                'image': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
                'category': 'Main Course'
            },
            {
                'restaurant': 'KFC',
                'name': 'Chicken Burger',
                'description': 'Crispy chicken burger with lettuce and mayo',
                'price': 12.50,
                'image': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400',
                'category': 'Burgers'
            },
            {
                'restaurant': 'KFC',
                'name': 'Hot Wings',
                'description': 'Spicy chicken wings with dipping sauce',
                'price': 15.00,
                'image': 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400',
                'category': 'Appetizers'
            },
            {
                'restaurant': 'Yapona Mama',
                'name': 'Sushi Roll Set',
                'description': 'Assorted sushi rolls with wasabi and ginger',
                'price': 28.00,
                'image': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
                'category': 'Sushi'
            },
            {
                'restaurant': 'Burger Embassy',
                'name': 'Double Beef Burger',
                'description': 'Double patty beef burger with cheese and special sauce',
                'price': 18.50,
                'image': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
                'category': 'Burgers'
            },
            {
                'restaurant': 'EVOS',
                'name': 'Margherita Pizza',
                'description': 'Classic pizza with tomato sauce, mozzarella, and basil',
                'price': 22.00,
                'image': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
                'category': 'Pizza'
            },
        ]
        
        for menu_item_data in menu_items_data:
            restaurant = next((r for r in restaurants if r.name == menu_item_data['restaurant']), None)
            if restaurant:
                MenuItem.objects.get_or_create(
                    restaurant=restaurant,
                    name=menu_item_data['name'],
                    defaults={
                        'description': menu_item_data['description'],
                        'price': menu_item_data['price'],
                        'image': menu_item_data['image'],
                        'category': menu_item_data['category']
                    }
                )
        
        # Create delivery addresses for users
        addresses_data = [
            {
                'user_phone': '+19900000000',
                'label': 'Home',
                'address': 'San Fransisco 14 St. 221, Holloway M.',
                'latitude': 41.3111,
                'longitude': 69.2797,
                'is_saved': True,
                'is_recent': True
            },
            {
                'user_phone': '+19900000000',
                'label': 'Office',
                'address': 'New York 14 St. 221, Holloway M.',
                'latitude': 41.3211,
                'longitude': 69.2897,
                'is_saved': True,
                'is_recent': False
            },
            {
                'user_phone': '+19901111111',
                'label': 'Apartment',
                'address': '123 Main St, Apt 5',
                'latitude': 41.305,
                'longitude': 69.290,
                'is_saved': True,
                'is_recent': True
            },
            {
                'user_phone': '+19901111111',
                'label': 'Work',
                'address': '500 Market St, Suite 200',
                'latitude': 41.310,
                'longitude': 69.280,
                'is_saved': True,
                'is_recent': False
            },
        ]
        
        for address_data in addresses_data:
            user = next((u for u in users if u.phone == address_data['user_phone']), None)
            if user:
                DeliveryAddress.objects.get_or_create(
                    user=user,
                    label=address_data['label'],
                    defaults={
                        'address': address_data['address'],
                        'latitude': address_data['latitude'],
                        'longitude': address_data['longitude'],
                        'is_saved': address_data['is_saved'],
                        'is_recent': address_data['is_recent']
                    }
                )
        
        # Create some orders
        customer = next((u for u in users if u.phone == '+19900000000'), None)
        restaurant = next((r for r in restaurants if r.name == 'KFC'), None)
        address = DeliveryAddress.objects.filter(user=customer).first()
        
        if customer and restaurant and address:
            order = Order.objects.create(
                order_number=f"ORD-{random.randint(10000, 99999)}",
                customer=customer,
                restaurant=restaurant,
                delivery_address=address,
                status='pending',
                payment_method='card',
                total=37.50,
                delivery_fee=3.50,
                estimated_delivery_time='18:50',
                preparation_time=10,
                notes="Don't add mayonnaise to lavash. Don't add pickles to the burger. Please don't forget to send a napkin."
            )
            
            # Add order items
            menu_item = MenuItem.objects.filter(restaurant=restaurant).first()
            if menu_item:
                OrderItem.objects.create(
                    order=order,
                    menu_item=menu_item,
                    name=menu_item.name,
                    description=menu_item.description,
                    price=menu_item.price,
                    quantity=1,
                    category=menu_item.category
                )
            
            # Create notification
            Notification.objects.create(
                user=customer,
                title='Order Created',
                message=f'Your order {order.order_number} has been created and is being processed.',
                notification_type='order',
                order=order
            )
            
            self.stdout.write(f'Created order: {order.order_number}')
        
        self.stdout.write(self.style.SUCCESS('Data population completed successfully!'))