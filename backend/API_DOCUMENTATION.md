# Food Delivery App Backend API Documentation

This document explains how the Django REST backend integrates with the React Native frontend UI/UX.

## Base URL

All API endpoints are prefixed with: `http://localhost:8000/api/v1/`

## Authentication

The app uses OTP-based authentication via phone numbers.

### Send OTP

**Endpoint:** `POST /accounts/auth/send-otp/`

**Request Body:**
```json
{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully"
}
```

### Verify OTP

**Endpoint:** `POST /accounts/auth/verify-otp/`

**Request Body:**
```json
{
  "phone": "+1234567890",
  "code": "123456",
  "name": "John Doe",
  "role": "customer"
}
```

**Response:**
```json
{
  "token": "user-auth-token",
  "user": {
    "id": 1,
    "phone": "+1234567890",
    "first_name": "John",
    "last_name": "Doe",
    "name": "John Doe",
    "role": "customer",
    "avatar": null,
    "rating": null
  }
}
```

## User Profile

### Get/Update User Profile

**Endpoint:** `GET/PUT /accounts/profile/`

**Headers:**
```
Authorization: Token user-auth-token
```

**Response:**
```json
{
  "id": 1,
  "phone": "+1234567890",
  "first_name": "John",
  "last_name": "Doe",
  "name": "John Doe",
  "role": "customer",
  "avatar": null,
  "rating": 4.5
}
```

## Address Management

### List/Create Addresses

**Endpoint:** `GET/POST /accounts/addresses/`

**Headers:**
```
Authorization: Token user-auth-token
```

**Request Body (POST):**
```json
{
  "label": "Home",
  "address": "123 Main St, Apt 5",
  "latitude": 41.3111,
  "longitude": 69.2797,
  "is_saved": true,
  "is_recent": true
}
```

### Get Recent Addresses

**Endpoint:** `GET /accounts/addresses/recent/`

**Headers:**
```
Authorization: Token user-auth-token
```

### Get Saved Addresses

**Endpoint:** `GET /accounts/addresses/saved/`

**Headers:**
```
Authorization: Token user-auth-token
```

## Restaurant Management

### List Restaurants

**Endpoint:** `GET /restaurants/restaurants/`

**Query Parameters:**
- `search`: Search by name or tags
- `ordering`: Order by rating or delivery_time

**Response:**
```json
[
  {
    "id": 1,
    "name": "KFC",
    "image": "https://images.unsplash.com/...",
    "logo": "https://images.unsplash.com/...",
    "rating": 4.5,
    "delivery_time": "45-55 min",
    "distance": "1.3 km",
    "latitude": 41.3035,
    "longitude": 69.28,
    "tags": [
      {"id": 1, "name": "Free delivery"},
      {"id": 2, "name": "40% off select items"}
    ],
    "menu_items": [
      {
        "id": 1,
        "restaurant": 1,
        "name": "Fried Chicken Bucket",
        "description": "8 pieces of crispy fried chicken",
        "price": "34.00",
        "image": "https://images.unsplash.com/...",
        "category": "Main Course"
      }
    ]
  }
]
```

### Get Restaurant Detail

**Endpoint:** `GET /restaurants/restaurants/{id}/`

### List Menu Items

**Endpoint:** `GET /restaurants/restaurants/{restaurant_id}/menu/`

### Get Popular Restaurants

**Endpoint:** `GET /restaurants/restaurants/popular/`

## Order Management

### List/Create Orders

**Endpoint:** `GET/POST /orders/orders/`

**Headers:**
```
Authorization: Token user-auth-token
```

**Request Body (POST):**
```json
{
  "restaurant": 1,
  "delivery_address": 1,
  "payment_method": "card",
  "total": 37.50,
  "delivery_fee": 3.50,
  "estimated_delivery_time": "18:50",
  "preparation_time": 10,
  "notes": "Special instructions here"
}
```

### Get Order Detail

**Endpoint:** `GET /orders/orders/{id}/`

**Headers:**
```
Authorization: Token user-auth-token
```

### Update Order Status

**Endpoint:** `PATCH /orders/orders/{id}/status/`

**Headers:**
```
Authorization: Token user-auth-token
```

**Request Body:**
```json
{
  "status": "preparing"
}
```

### List Order Items

**Endpoint:** `GET /orders/orders/{order_id}/items/`

### Create Order Item

**Endpoint:** `POST /orders/orders/{order_id}/items/`

**Request Body:**
```json
{
  "menu_item": 1,
  "name": "Fried Chicken Bucket",
  "description": "8 pieces of crispy fried chicken",
  "price": "34.00",
  "quantity": 1,
  "category": "Main Course"
}
```

## Reviews

### List/Create Reviews

**Endpoint:** `GET/POST /orders/reviews/`

**Headers:**
```
Authorization: Token user-auth-token
```

**Request Body (POST):**
```json
{
  "order": 1,
  "rating": 5,
  "comment": "Great food and fast delivery!"
}
```

## Notifications

### List Notifications

**Endpoint:** `GET /orders/notifications/`

**Headers:**
```
Authorization: Token user-auth-token
```

### Mark Notification as Read

**Endpoint:** `PATCH /orders/notifications/{id}/`

**Headers:**
```
Authorization: Token user-auth-token
```

**Request Body:**
```json
{
  "read": true
}
```

## Driver Management

### Get/Update Driver Profile

**Endpoint:** `GET/PUT /accounts/driver-profile/`

**Headers:**
```
Authorization: Token user-auth-token
```

**Request Body (PUT):**
```json
{
  "vehicle_type": "Car",
  "vehicle_brand": "Toyota",
  "vehicle_model": "Corolla",
  "plate_number": "ABC123",
  "color": "Red"
}
```

## Integration with Frontend UI/UX

### Home Screen
- Uses `/restaurants/restaurants/` to display popular restaurants
- Uses `/restaurants/restaurants/popular/` for featured restaurants
- Uses `/accounts/addresses/recent/` and `/accounts/addresses/saved/` for address selection

### Restaurant Detail Screen
- Uses `/restaurants/restaurants/{id}/` to get restaurant details
- Uses `/restaurants/restaurants/{id}/menu/` to display menu items

### Cart & Checkout
- Uses `/orders/orders/` to create new orders
- Uses `/orders/orders/{id}/items/` to add items to orders

### Order Tracking
- Uses `/orders/orders/` to list user orders
- Uses `/orders/orders/{id}/` to get order details
- Uses `/orders/notifications/` to show order status updates

### Address Management
- Uses `/accounts/addresses/` to manage saved addresses
- Uses `/accounts/addresses/recent/` for recent addresses in the modal

### Authentication Flow
- Uses `/accounts/auth/send-otp/` to send OTP during login
- Uses `/accounts/auth/verify-otp/` to verify OTP and authenticate user
- Uses `/accounts/profile/` to get/update user profile information

## Error Handling

The API returns standard HTTP status codes:
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow this format:
```json
{
  "error": "Error message"
}
```

## Pagination

List endpoints support pagination with default page size of 20 items.
Query parameters:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20)

Response includes pagination metadata in headers:
- `Count`: Total number of items
- `Next`: URL for next page
- `Previous`: URL for previous page