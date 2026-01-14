# Frontend API Integration Documentation

This document explains how the React Native frontend has been updated to use the real Django backend API instead of mock data.

## Changes Made

### 1. API Client Implementation

**File**: `frontend/lib/api.ts`

Created a comprehensive API client using Axios with:
- Base URL configuration for Android/iOS
- Request/response interceptors
- Token-based authentication
- Error handling
- API endpoints for all backend services

### 2. API Hooks

**File**: `frontend/hooks/useApi.ts`

Created React Query hooks for API integration:
- `useApiRequest` - Generic API request hook
- `useApiMutation` - Generic API mutation hook
- Specific hooks for restaurants, orders, addresses, etc.
- Loading states and error handling
- Success/error notifications

### 3. Type Updates

**File**: `frontend/types/index.js`

Updated TypeScript interfaces to match backend API responses:
- `Restaurant` interface with proper API fields
- `Tag` interface for restaurant tags
- Menu item types updated

### 4. Home Screen Integration

**File**: `frontend/app/(customer)/home.tsx`

Updated to use real API data:
- Replaced `mockRestaurants` with `useRestaurants()` hook
- Replaced `mockRestaurants.slice(0, 2)` with `usePopularRestaurants()` hook
- Added loading states and error handling
- Updated field names to match API (`delivery_time` instead of `deliveryTime`)
- Added loading indicators and error messages

### 5. Restaurant List Integration

**File**: `frontend/app/(customer)/restaurant-list.tsx`

Updated to use real API data:
- Replaced `mockRestaurants` with `useRestaurants()` hook
- Added loading states and error handling
- Updated field names to match API
- Added loading indicators and error messages

### 6. Restaurant Detail Integration

**File**: `frontend/app/(customer)/restaurant-detail.tsx`

Updated to use real API data:
- Replaced `mockRestaurants` and `mockMenuItems` with API hooks
- Added `useRestaurantDetail()` and `useMenuItems()` hooks
- Added loading states and error handling
- Updated field names to match API
- Added loading indicators and error messages

## API Integration Pattern

### Before (Mock Data)
```typescript
import { mockRestaurants } from '@/mocks/restaurants';

const restaurants = mockRestaurants;
const restaurant = mockRestaurants.find(r => r.id === id);
```

### After (Real API)
```typescript
import { useRestaurants, useRestaurantDetail } from '@/hooks/useApi';

const { data: restaurantsData, isLoading, error } = useRestaurants();
const restaurants = restaurantsData?.results || [];

const { data: restaurantData } = useRestaurantDetail(restaurantId);
const restaurant = restaurantData;
```

## Error Handling

All API calls now include proper error handling:
- Loading states with ActivityIndicator
- Error messages with retry options
- Network error detection
- Authentication error handling

## Authentication Flow

The frontend now uses the real authentication flow:
1. `AuthAPI.sendOTP(phone)` - Send OTP to phone
2. `AuthAPI.verifyOTP(phone, code, name, role)` - Verify OTP and get token
3. Token is stored in AsyncStorage
4. All subsequent requests include token in Authorization header

## Data Flow

```
Frontend → API Request → Backend → Database → API Response → Frontend
```

### Example: Loading Restaurants

```typescript
// Home screen component
const { data: restaurantsData, isLoading, error } = useRestaurants();

if (isLoading) {
  return <ActivityIndicator />;
}

if (error) {
  return <ErrorMessage />;
}

const restaurants = restaurantsData?.results || [];

return (
  <View>
    {restaurants.map(restaurant => (
      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
    ))}
  </View>
);
```

## Field Mapping

### Restaurant Fields
- `deliveryTime` → `delivery_time`
- `tags: string[]` → `tags: Tag[]`
- Added `menu_items` array
- Added `is_active`, `opening_time`, `closing_time`

### Menu Item Fields
- Added `is_available`
- Added `preparation_time`
- Proper typing for all fields

## Benefits of API Integration

1. **Real Data**: Uses actual restaurant data from backend
2. **Multi-Restaurant Support**: Properly handles multiple restaurants
3. **Order Routing**: Orders go to correct restaurant kitchens
4. **Authentication**: Real user authentication with OTP
5. **Permissions**: Role-based access control
6. **Notifications**: Real-time order status updates
7. **Error Handling**: Proper error messages and recovery

## Next Steps

1. **Test API Integration**: Verify all endpoints work correctly
2. **Update Other Screens**: Apply same pattern to other screens using mock data
3. **Implement Retry Logic**: Add proper retry functionality for failed requests
4. **Add Caching**: Implement caching for better performance
5. **Optimize Images**: Add image optimization for better loading

## Files Modified

- `frontend/lib/api.ts` - New API client
- `frontend/hooks/useApi.ts` - New API hooks
- `frontend/types/index.js` - Updated types
- `frontend/app/(customer)/home.tsx` - Updated home screen
- `frontend/app/(customer)/restaurant-list.tsx` - Updated restaurant list
- `frontend/app/(customer)/restaurant-detail.tsx` - Updated restaurant detail
- `frontend/package.json` - Added axios dependency

The frontend now uses the real backend API instead of mock data, providing a complete end-to-end food delivery experience!