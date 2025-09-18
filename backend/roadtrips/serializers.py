from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import RoadTrip, TripEligibility, TripParticipant, TripNotification
from cars.models import CarBrand, CarModel, CarType
from accounts.serializers import UserProfileSerializer


class TripEligibilitySerializer(serializers.ModelSerializer):
    """Serializer for trip eligibility criteria"""
    eligible_brands = serializers.PrimaryKeyRelatedField(
        queryset=CarBrand.objects.all(),
        many=True,
        required=False
    )
    eligible_models = serializers.PrimaryKeyRelatedField(
        queryset=CarModel.objects.all(),
        many=True,
        required=False
    )
    eligible_types = serializers.PrimaryKeyRelatedField(
        queryset=CarType.objects.all(),
        many=True,
        required=False
    )
    
    # Read-only fields for display
    eligible_brands_display = serializers.SerializerMethodField()
    eligible_models_display = serializers.SerializerMethodField()
    eligible_types_display = serializers.SerializerMethodField()
    
    class Meta:
        model = TripEligibility
        fields = [
            'eligible_brands', 'eligible_models', 'eligible_types', 'open_to_all',
            'eligible_brands_display', 'eligible_models_display', 'eligible_types_display'
        ]
    
    def get_eligible_brands_display(self, obj):
        return [brand.name for brand in obj.eligible_brands.all()]
    
    def get_eligible_models_display(self, obj):
        return [f"{model.brand.name} {model.name}" for model in obj.eligible_models.all()]
    
    def get_eligible_types_display(self, obj):
        return [car_type.name for car_type in obj.eligible_types.all()]


class TripParticipantSerializer(serializers.ModelSerializer):
    """Serializer for trip participants"""
    user = UserProfileSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TripParticipant
        fields = [
            'id', 'user', 'user_id', 'status', 'joined_at', 'updated_at',
            'message', 'emergency_contact'
        ]
        read_only_fields = ['joined_at', 'updated_at']


class RoadTripListSerializer(serializers.ModelSerializer):
    """Simplified serializer for trip listings"""
    organizer = UserProfileSerializer(read_only=True)
    participant_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    
    class Meta:
        model = RoadTrip
        fields = [
            'id', 'title', 'destination', 'departure_date', 'meeting_point',
            'organizer', 'status', 'max_participants', 'participant_count',
            'is_full', 'is_upcoming', 'difficulty_level', 'estimated_duration',
            'estimated_distance', 'created_at'
        ]


class RoadTripDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual trip view"""
    organizer = UserProfileSerializer(read_only=True)
    eligibility = TripEligibilitySerializer(read_only=True)
    participants = TripParticipantSerializer(many=True, read_only=True)
    participant_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    
    # Check if current user is eligible and participating
    user_eligible = serializers.SerializerMethodField()
    user_participating = serializers.SerializerMethodField()
    user_participation_status = serializers.SerializerMethodField()
    
    class Meta:
        model = RoadTrip
        fields = [
            'id', 'title', 'destination', 'departure_date', 'meeting_point',
            'description', 'organizer', 'status', 'max_participants',
            'participant_count', 'is_full', 'is_upcoming', 'difficulty_level',
            'estimated_duration', 'estimated_distance', 'created_at', 'updated_at',
            'eligibility', 'participants', 'user_eligible', 'user_participating',
            'user_participation_status'
        ]
    
    def get_user_eligible(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if hasattr(obj, 'eligibility'):
                return obj.eligibility.is_user_eligible(request.user)
        return False
    
    def get_user_participating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.participants.filter(user=request.user).exists()
        return False
    
    def get_user_participation_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            participation = obj.participants.filter(user=request.user).first()
            return participation.status if participation else None
        return None


class RoadTripCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating trips"""
    eligibility = TripEligibilitySerializer(required=False)
    
    class Meta:
        model = RoadTrip
        fields = [
            'title', 'destination', 'departure_date', 'meeting_point',
            'description', 'max_participants', 'estimated_duration',
            'estimated_distance', 'difficulty_level', 'eligibility'
        ]
    
    def validate_departure_date(self, value):
        """Ensure departure date is at least 3 days in advance"""
        min_advance_date = timezone.now() + timedelta(days=3)
        if value < min_advance_date:
            raise serializers.ValidationError(
                "Departure date must be at least 3 days in advance"
            )
        return value
    
    def validate_title(self, value):
        """Validate trip title length"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Trip title must be at least 3 characters long"
            )
        return value.strip()
    
    def validate_destination(self, value):
        """Validate destination length"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Destination must be at least 3 characters long"
            )
        return value.strip()
    
    def validate_meeting_point(self, value):
        """Validate meeting point length"""
        if len(value.strip()) < 5:
            raise serializers.ValidationError(
                "Meeting point must be at least 5 characters long"
            )
        return value.strip()
    
    def validate_description(self, value):
        """Validate description length"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Description must be at least 10 characters long"
            )
        return value.strip()
    
    def create(self, validated_data):
        """Create trip with eligibility criteria"""
        eligibility_data = validated_data.pop('eligibility', {})
        
        # Set organizer from request user
        request = self.context.get('request')
        validated_data['organizer'] = request.user
        
        # Create the trip
        trip = RoadTrip.objects.create(**validated_data)
        
        # Create eligibility criteria
        self._create_or_update_eligibility(trip, eligibility_data)
        
        return trip
    
    def update(self, instance, validated_data):
        """Update trip with eligibility criteria"""
        eligibility_data = validated_data.pop('eligibility', None)
        
        # Update trip fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update eligibility criteria if provided
        if eligibility_data is not None:
            self._create_or_update_eligibility(instance, eligibility_data)
        
        return instance
    
    def _create_or_update_eligibility(self, trip, eligibility_data):
        """Helper method to create or update eligibility criteria"""
        if not eligibility_data:
            # Create default open-to-all eligibility
            TripEligibility.objects.update_or_create(
                trip=trip,
                defaults={'open_to_all': True}
            )
            return
        
        # Extract many-to-many fields
        eligible_brands = eligibility_data.pop('eligible_brands', [])
        eligible_models = eligibility_data.pop('eligible_models', [])
        eligible_types = eligibility_data.pop('eligible_types', [])
        
        # Create or update eligibility
        eligibility, created = TripEligibility.objects.update_or_create(
            trip=trip,
            defaults=eligibility_data
        )
        
        # Set many-to-many relationships
        eligibility.eligible_brands.set(eligible_brands)
        eligibility.eligible_models.set(eligible_models)
        eligibility.eligible_types.set(eligible_types)


class TripNotificationSerializer(serializers.ModelSerializer):
    """Serializer for trip notifications"""
    trip = RoadTripListSerializer(read_only=True)
    related_user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = TripNotification
        fields = [
            'id', 'trip', 'notification_type', 'title', 'message',
            'is_read', 'created_at', 'related_user'
        ]
        read_only_fields = ['created_at']


class JoinTripSerializer(serializers.Serializer):
    """Serializer for joining a trip"""
    message = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
        help_text="Optional message to the trip organizer"
    )
    emergency_contact = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        help_text="Emergency contact information"
    )