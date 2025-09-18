from django.contrib import admin
from .models import RoadTrip, TripEligibility, TripParticipant, TripNotification


class TripEligibilityInline(admin.StackedInline):
    """Inline for trip eligibility criteria"""
    model = TripEligibility
    extra = 0
    filter_horizontal = ['eligible_brands', 'eligible_models', 'eligible_types']


class TripParticipantInline(admin.TabularInline):
    """Inline for trip participants"""
    model = TripParticipant
    extra = 0
    readonly_fields = ['joined_at', 'updated_at']


@admin.register(RoadTrip)
class RoadTripAdmin(admin.ModelAdmin):
    """Admin for road trips"""
    list_display = [
        'title', 'destination', 'organizer', 'departure_date', 
        'status', 'participant_count', 'max_participants', 'created_at'
    ]
    list_filter = ['status', 'difficulty_level', 'departure_date', 'created_at']
    search_fields = ['title', 'destination', 'description', 'organizer__name']
    readonly_fields = ['created_at', 'updated_at', 'participant_count']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'destination', 'organizer', 'status')
        }),
        ('Trip Details', {
            'fields': ('departure_date', 'meeting_point', 'description')
        }),
        ('Trip Settings', {
            'fields': ('max_participants', 'difficulty_level', 'estimated_duration', 'estimated_distance')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [TripEligibilityInline, TripParticipantInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('organizer')


@admin.register(TripEligibility)
class TripEligibilityAdmin(admin.ModelAdmin):
    """Admin for trip eligibility"""
    list_display = ['trip', 'open_to_all', 'get_eligible_brands', 'get_eligible_types']
    list_filter = ['open_to_all']
    filter_horizontal = ['eligible_brands', 'eligible_models', 'eligible_types']
    
    def get_eligible_brands(self, obj):
        return ", ".join([brand.name for brand in obj.eligible_brands.all()[:3]])
    get_eligible_brands.short_description = 'Eligible Brands'
    
    def get_eligible_types(self, obj):
        return ", ".join([car_type.name for car_type in obj.eligible_types.all()[:3]])
    get_eligible_types.short_description = 'Eligible Types'


@admin.register(TripParticipant)
class TripParticipantAdmin(admin.ModelAdmin):
    """Admin for trip participants"""
    list_display = ['user', 'trip', 'status', 'joined_at']
    list_filter = ['status', 'joined_at']
    search_fields = ['user__name', 'trip__title']
    readonly_fields = ['joined_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'trip')


@admin.register(TripNotification)
class TripNotificationAdmin(admin.ModelAdmin):
    """Admin for trip notifications"""
    list_display = ['recipient', 'trip', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['recipient__name', 'trip__title', 'title']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('recipient', 'trip', 'related_user')
