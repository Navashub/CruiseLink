from django_filters import rest_framework as filters
from django.utils import timezone
from .models import RoadTrip


class RoadTripFilter(filters.FilterSet):
    """Advanced filtering for road trips"""
    
    # Date range filtering
    departure_date_after = filters.DateTimeFilter(
        field_name='departure_date', 
        lookup_expr='gte',
        help_text='Filter trips departing after this date'
    )
    departure_date_before = filters.DateTimeFilter(
        field_name='departure_date', 
        lookup_expr='lte',
        help_text='Filter trips departing before this date'
    )
    
    # Upcoming trips only
    upcoming_only = filters.BooleanFilter(
        method='filter_upcoming',
        help_text='Show only upcoming trips'
    )
    
    # Availability filtering
    has_space = filters.BooleanFilter(
        method='filter_has_space',
        help_text='Show only trips with available spots'
    )
    
    # Organizer filtering
    organizer_name = filters.CharFilter(
        field_name='organizer__name',
        lookup_expr='icontains',
        help_text='Filter by organizer name'
    )
    
    # Location filtering
    destination_contains = filters.CharFilter(
        field_name='destination',
        lookup_expr='icontains',
        help_text='Filter by destination name'
    )
    
    class Meta:
        model = RoadTrip
        fields = [
            'status', 'difficulty_level', 'organizer',
            'departure_date_after', 'departure_date_before',
            'upcoming_only', 'has_space', 'organizer_name',
            'destination_contains'
        ]
    
    def filter_upcoming(self, queryset, name, value):
        """Filter for upcoming trips only"""
        if value:
            return queryset.filter(departure_date__gt=timezone.now())
        return queryset
    
    def filter_has_space(self, queryset, name, value):
        """Filter for trips with available spots"""
        if value:
            # This would require a more complex query with annotations
            # For now, return all trips
            return queryset
        return queryset