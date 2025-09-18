from django.shortcuts import render
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
from .models import RoadTrip, TripParticipant, TripNotification
from .serializers import (
    RoadTripListSerializer,
    RoadTripDetailSerializer,
    RoadTripCreateUpdateSerializer,
    TripParticipantSerializer,
    TripNotificationSerializer,
    JoinTripSerializer
)


class RoadTripViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing road trips
    
    Provides endpoints for:
    - List trips (with filtering and search)
    - Create new trip
    - Retrieve trip details
    - Update trip (organizer only)
    - Delete trip (organizer only)
    - Join/leave trip
    - Manage participants
    """
    queryset = RoadTrip.objects.select_related(
        'organizer', 'eligibility'
    ).prefetch_related(
        'participants__user',
        'eligibility__eligible_brands',
        'eligibility__eligible_models',
        'eligibility__eligible_types'
    ).all()
    
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtering options
    filterset_fields = ['status', 'difficulty_level', 'organizer']
    search_fields = ['title', 'destination', 'description']
    ordering_fields = ['departure_date', 'created_at', 'participant_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return RoadTripListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return RoadTripCreateUpdateSerializer
        else:
            return RoadTripDetailSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by upcoming trips only
        if self.request.query_params.get('upcoming') == 'true':
            queryset = queryset.filter(departure_date__gt=timezone.now())
        
        # Filter by trips user is eligible for
        if self.request.query_params.get('eligible') == 'true':
            # This would require complex filtering based on user's car
            # For now, return all trips (eligibility is checked in serializer)
            pass
        
        # Filter by trips user is participating in
        if self.request.query_params.get('my_trips') == 'true':
            queryset = queryset.filter(
                Q(organizer=self.request.user) |
                Q(participants__user=self.request.user)
            ).distinct()
        
        # Filter by trips user organized
        if self.request.query_params.get('organized') == 'true':
            queryset = queryset.filter(organizer=self.request.user)
        
        return queryset
    
    def perform_create(self, serializer):
        """Set the organizer when creating a trip"""
        serializer.save(organizer=self.request.user)
    
    def update(self, request, *args, **kwargs):
        """Only allow organizer to update trip"""
        trip = self.get_object()
        if trip.organizer != request.user:
            return Response(
                {'error': 'Only the trip organizer can update this trip'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Only allow organizer to delete trip"""
        trip = self.get_object()
        if trip.organizer != request.user:
            return Response(
                {'error': 'Only the trip organizer can delete this trip'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a trip"""
        trip = self.get_object()
        user = request.user
        
        # Check if user is already participating
        if trip.participants.filter(user=user).exists():
            return Response(
                {'error': 'You are already participating in this trip'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if trip is full
        if trip.is_full:
            return Response(
                {'error': 'This trip is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if trip is in the past
        if not trip.is_upcoming:
            return Response(
                {'error': 'Cannot join a trip that has already started or ended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check eligibility
        if hasattr(trip, 'eligibility') and not trip.eligibility.is_user_eligible(user):
            return Response(
                {'error': 'Your car does not meet the eligibility criteria for this trip'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process join request
        serializer = JoinTripSerializer(data=request.data)
        if serializer.is_valid():
            participant = TripParticipant.objects.create(
                trip=trip,
                user=user,
                status='confirmed',  # Auto-confirm for now
                message=serializer.validated_data.get('message', ''),
                emergency_contact=serializer.validated_data.get('emergency_contact', '')
            )
            
            # Create notification for organizer
            TripNotification.objects.create(
                recipient=trip.organizer,
                trip=trip,
                notification_type='participant_joined',
                title=f"{user.name} joined your trip",
                message=f"{user.name} has joined your trip '{trip.title}'",
                related_user=user
            )
            
            return Response(
                TripParticipantSerializer(participant).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a trip"""
        trip = self.get_object()
        user = request.user
        
        try:
            participant = trip.participants.get(user=user)
        except TripParticipant.DoesNotExist:
            return Response(
                {'error': 'You are not participating in this trip'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Don't allow leaving if trip is starting soon (less than 24 hours)
        if trip.departure_date <= timezone.now() + timezone.timedelta(hours=24):
            return Response(
                {'error': 'Cannot leave a trip less than 24 hours before departure'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participant.delete()
        
        # Create notification for organizer
        TripNotification.objects.create(
            recipient=trip.organizer,
            trip=trip,
            notification_type='participant_left',
            title=f"{user.name} left your trip",
            message=f"{user.name} has left your trip '{trip.title}'",
            related_user=user
        )
        
        return Response(
            {'message': 'Successfully left the trip'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        """Get trip participants"""
        trip = self.get_object()
        participants = trip.participants.all()
        serializer = TripParticipantSerializer(participants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_participant_status(self, request, pk=None):
        """Update participant status (organizer only)"""
        trip = self.get_object()
        
        if trip.organizer != request.user:
            return Response(
                {'error': 'Only the trip organizer can update participant status'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        participant_id = request.data.get('participant_id')
        new_status = request.data.get('status')
        
        if not participant_id or not new_status:
            return Response(
                {'error': 'participant_id and status are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            participant = trip.participants.get(id=participant_id)
        except TripParticipant.DoesNotExist:
            return Response(
                {'error': 'Participant not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        old_status = participant.status
        participant.status = new_status
        participant.save()
        
        # Create notification for participant
        if new_status != old_status:
            notification_type = 'request_approved' if new_status == 'confirmed' else 'request_declined'
            TripNotification.objects.create(
                recipient=participant.user,
                trip=trip,
                notification_type=notification_type,
                title=f"Trip participation {new_status}",
                message=f"Your participation in '{trip.title}' has been {new_status}",
                related_user=trip.organizer
            )
        
        return Response(TripParticipantSerializer(participant).data)


class TripNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for trip notifications
    
    Provides endpoints for:
    - List user's notifications
    - Mark notifications as read
    - Get unread count
    """
    serializer_class = TripNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return notifications for the current user"""
        return TripNotification.objects.filter(
            recipient=self.request.user
        ).select_related('trip', 'related_user')
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        count = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'message': f'{count} notifications marked as read'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})
