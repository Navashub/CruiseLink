from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoadTripViewSet, TripNotificationViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'trips', RoadTripViewSet, basename='roadtrip')
router.register(r'notifications', TripNotificationViewSet, basename='tripnotification')

app_name = 'roadtrips'

urlpatterns = [
    path('api/', include(router.urls)),
]

# Available endpoints:
# GET    /api/trips/                    - List all trips (with filtering)
# POST   /api/trips/                    - Create new trip
# GET    /api/trips/{id}/               - Get trip details
# PUT    /api/trips/{id}/               - Update trip (organizer only)
# PATCH  /api/trips/{id}/               - Partial update trip (organizer only)
# DELETE /api/trips/{id}/               - Delete trip (organizer only)
# POST   /api/trips/{id}/join/          - Join a trip
# POST   /api/trips/{id}/leave/         - Leave a trip
# GET    /api/trips/{id}/participants/  - Get trip participants
# POST   /api/trips/{id}/update_participant_status/ - Update participant status (organizer only)
#
# GET    /api/notifications/            - List user's notifications
# GET    /api/notifications/{id}/       - Get notification details
# POST   /api/notifications/{id}/mark_read/ - Mark notification as read
# POST   /api/notifications/mark_all_read/  - Mark all notifications as read
# GET    /api/notifications/unread_count/   - Get unread notifications count