# Multi-Restaurant Food Delivery System Implementation

This document explains how the backend now supports multiple restaurants with proper order routing to restaurant kitchens, and how it connects to the frontend UI/UX.

## Key Changes Made

### 1. Restaurant-Kitchen Staff Relationship

**Added Models:**
- `KitchenStaff` model to properly associate kitchen staff with specific restaurants
- `kitchen_staff` ManyToManyField on Restaurant model
- Restaurant opening/closing times and active status

**Database Schema:**
```
Restaurant
  - kitchen_staff (ManyToManyField to User)
  - is_active (BooleanField)
  - opening_time (TimeField)
  - closing_time (TimeField)

KitchenStaff
  - user (OneToOneField to User)
  - restaurant (ForeignKey to Restaurant)
  - position (CharField: chef, cook, manager, assistant)
  - is_active (BooleanField)
```

### 2. Menu Item Enhancements

**Added Fields:**
- `is_available` - Whether the menu item is currently available
- `preparation_time` - Estimated preparation time in minutes
- Proper ordering by category and name

### 3. Order Routing to Restaurant Kitchens

**Enhanced Order Creation:**
- Orders are now automatically routed to the correct restaurant based on the `restaurant` field
- Kitchen staff receive notifications when new orders are placed for their restaurant
- Order queries filter by restaurant for kitchen staff

**Notification System:**
- Customers get order confirmation notifications
- Kitchen staff get new order notifications for their specific restaurant
- Status change notifications go to the correct restaurant staff

### 4. Kitchen Staff Management

**New API Endpoints:**
- `GET/POST /api/v1/restaurants/kitchen-staff/` - List/create kitchen staff
- `GET/PUT/DELETE /api/v1/restaurants/kitchen-staff/{id}/` - Kitchen staff details
- `GET /api/v1/restaurants/my-restaurant-orders/` - Orders for staff's restaurant

**Permission System:**
- **Managers**: Can see and manage all kitchen staff in their restaurant
- **Regular Staff**: Can only see themselves and their restaurant's orders
- **Admins**: Can see and manage all kitchen staff across all restaurants

## API Endpoints for Multi-Restaurant System

### Restaurant Management

**List Restaurants**
```
GET /api/v1/restaurants/restaurants/
```
Returns all active restaurants with their details, tags, and menu items.

**Restaurant Details**
```
GET /api/v1/restaurants/restaurants/{id}/
```
Returns complete restaurant information including menu items and kitchen staff.

**Menu Items**
```
GET /api/v1/restaurants/restaurants/{restaurant_id}/menu/
```
Returns all menu items for a specific restaurant.

### Kitchen Staff Management

**List Kitchen Staff**
```
GET /api/v1/restaurants/kitchen-staff/
```
Returns kitchen staff based on user permissions.

**Kitchen Staff Details**
```
GET /api/v1/restaurants/kitchen-staff/{id}/
```
Returns details for a specific kitchen staff member.

**My Restaurant Orders**
```
GET /api/v1/restaurants/my-restaurant-orders/
```
Returns all orders for the kitchen staff's assigned restaurant.

### Order Management

**Create Order**
```
POST /api/v1/orders/orders/
```
Request body must include `restaurant` field to route order to correct kitchen.

**Order Status Update**
```
PATCH /api/v1/orders/orders/{id}/status/
```
Kitchen staff can update order status (preparing → ready).

## Frontend Integration

### Home Screen
- **Restaurant Listing**: Uses `GET /api/v1/restaurants/restaurants/`
- **Search & Filter**: Uses search and ordering parameters
- **Restaurant Cards**: Display name, image, rating, delivery time

### Restaurant Detail Screen
- **Restaurant Info**: Uses `GET /api/v1/restaurants/restaurants/{id}/`
- **Menu Items**: Uses `GET /api/v1/restaurants/restaurants/{id}/menu/`
- **Categories**: Menu items are grouped by category

### Cart & Checkout
- **Order Creation**: Uses `POST /api/v1/orders/orders/` with restaurant ID
- **Menu Item Selection**: Uses menu item IDs from restaurant menu
- **Order Confirmation**: Shows order number and estimated delivery time

### Kitchen View (New)
- **Order List**: Uses `GET /api/v1/restaurants/my-restaurant-orders/`
- **Order Details**: Uses `GET /api/v1/orders/orders/{id}/`
- **Status Updates**: Uses `PATCH /api/v1/orders/orders/{id}/status/`
- **Notifications**: Uses `GET /api/v1/orders/notifications/`

### Authentication Flow
- **OTP Login**: Uses `POST /api/v1/accounts/auth/send-otp/` and `POST /api/v1/accounts/auth/verify-otp/`
- **Role-Based Access**: Kitchen staff role redirects to kitchen view
- **User Profile**: Uses `GET /api/v1/accounts/profile/`

## Order Flow Example

1. **Customer** browses restaurants and selects "KFC"
2. **Customer** adds items to cart from KFC's menu
3. **Customer** checks out, order is created with `restaurant: 1` (KFC's ID)
4. **Backend** routes order to KFC's kitchen
5. **KFC Kitchen Staff** see the order in their "My Restaurant Orders" list
6. **KFC Kitchen Staff** update status from "pending" to "preparing"
7. **Customer** receives notification about status change
8. **KFC Kitchen Staff** update status to "ready"
9. **Driver** gets assigned and updates status to "picking_up"
10. **Customer** receives final notification when order is "delivering"

## Data Flow

```
Frontend UI → API Request → Backend Processing → Database → API Response → Frontend Update
```

### Example: Order Creation

**Frontend Request:**
```json
POST /api/v1/orders/orders/
{
  "restaurant": 1,  // KFC's ID
  "delivery_address": 1,
  "payment_method": "card",
  "total": 37.50,
  "items": [
    {
      "menu_item": 1,
      "quantity": 1
    }
  ]
}
```

**Backend Processing:**
1. Create order with status "pending"
2. Associate order with KFC (restaurant_id=1)
3. Create notification for customer
4. Find all kitchen staff for KFC
5. Create notifications for each kitchen staff member
6. Return order confirmation

**Frontend Response:**
```json
{
  "id": 123,
  "order_number": "ORD-12345",
  "status": "pending",
  "restaurant": {
    "id": 1,
    "name": "KFC"
  },
  "estimated_delivery_time": "18:50"
}
```

## Security & Permissions

### Authentication
- All endpoints require token authentication
- OTP-based phone authentication for login
- Token-based API access after login

### Authorization
- **Customers**: Can only access their own orders and profiles
- **Kitchen Staff**: Can only access their restaurant's orders
- **Drivers**: Can only access their assigned orders
- **Managers**: Can manage kitchen staff in their restaurant
- **Admins**: Full access to all data

## Error Handling

The system handles various error scenarios:
- **Restaurant Not Found**: 404 error if restaurant doesn't exist
- **Invalid Order**: 400 error for invalid order data
- **Unauthorized Access**: 401 error for missing authentication
- **Permission Denied**: 403 error for accessing other restaurants' data
- **Restaurant Closed**: Orders cannot be placed to closed restaurants

## Performance Considerations

- **Database Indexing**: Proper indexes on restaurant and user relationships
- **Query Optimization**: Efficient queries for kitchen staff orders
- **Caching**: Restaurant data can be cached for better performance
- **Pagination**: All list endpoints support pagination

## Testing

The system has been tested with:
- Multiple restaurants with different menus
- Kitchen staff assigned to specific restaurants
- Order routing to correct kitchens
- Permission-based access control
- Notification system for order updates

## Frontend Integration Checklist

✅ **Restaurant Listing**: Working with search and filters
✅ **Restaurant Details**: Working with menu items
✅ **Order Creation**: Working with restaurant routing
✅ **Kitchen View**: Working with restaurant-specific orders
✅ **Authentication**: Working with OTP and role-based access
✅ **Notifications**: Working for order status updates
✅ **Multi-Restaurant Support**: Fully implemented and tested

## Deployment Notes

The backend is ready for production deployment with:
- Proper CORS configuration for React Native frontend
- Secure authentication with token-based access
- Comprehensive error handling
- Efficient database queries
- Complete API documentation

The multi-restaurant food delivery system is now fully functional and ready to connect to the React Native frontend!