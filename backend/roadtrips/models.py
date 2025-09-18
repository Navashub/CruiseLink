from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinLengthValidator
from django.utils import timezone
from datetime import timedelta
from cars.models import CarBrand, CarModel, CarType

User = get_user_model()


class RoadTrip(models.Model):
    """Main road trip model"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    # Basic trip information
    title = models.CharField(
        max_length=200, 
        validators=[MinLengthValidator(3, "Trip title must be at least 3 characters long")]
    )
    destination = models.CharField(
        max_length=300,
        validators=[MinLengthValidator(3, "Destination must be at least 3 characters long")]
    )
    departure_date = models.DateTimeField()
    meeting_point = models.CharField(
        max_length=300,
        validators=[MinLengthValidator(5, "Meeting point must be at least 5 characters long")]
    )
    description = models.TextField(
        validators=[MinLengthValidator(10, "Description must be at least 10 characters long")]
    )
    
    # Trip metadata
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_trips')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published')
    max_participants = models.PositiveIntegerField(default=20, help_text="Maximum number of participants")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Optional trip enhancements
    estimated_duration = models.CharField(max_length=100, blank=True, help_text="e.g., '2 days', '6 hours'")
    estimated_distance = models.CharField(max_length=100, blank=True, help_text="e.g., '500 miles', '800 km'")
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('easy', 'Easy'),
            ('moderate', 'Moderate'),
            ('challenging', 'Challenging'),
        ],
        default='easy'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['departure_date']),
            models.Index(fields=['status']),
            models.Index(fields=['organizer']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.destination}"
    
    def clean(self):
        """Custom validation"""
        from django.core.exceptions import ValidationError
        
        if self.departure_date:
            min_advance_date = timezone.now() + timedelta(days=3)
            if self.departure_date < min_advance_date:
                raise ValidationError("Departure date must be at least 3 days in advance")
    
    @property
    def is_full(self):
        """Check if trip has reached maximum participants"""
        return self.participants.filter(status='confirmed').count() >= self.max_participants
    
    @property
    def participant_count(self):
        """Get current confirmed participant count"""
        return self.participants.filter(status='confirmed').count()
    
    @property
    def is_upcoming(self):
        """Check if trip is in the future"""
        return self.departure_date > timezone.now()


class TripEligibility(models.Model):
    """Car eligibility criteria for trips"""
    trip = models.OneToOneField(RoadTrip, on_delete=models.CASCADE, related_name='eligibility')
    
    # Eligible car brands (many-to-many)
    eligible_brands = models.ManyToManyField(CarBrand, blank=True, related_name='eligible_trips')
    
    # Eligible specific car models (many-to-many)
    eligible_models = models.ManyToManyField(CarModel, blank=True, related_name='eligible_trips')
    
    # Eligible car types (many-to-many)
    eligible_types = models.ManyToManyField(CarType, blank=True, related_name='eligible_trips')
    
    # Open to all cars if no specific criteria set
    open_to_all = models.BooleanField(default=False)
    
    class Meta:
        verbose_name_plural = "Trip Eligibilities"
    
    def __str__(self):
        return f"Eligibility for {self.trip.title}"
    
    def is_user_eligible(self, user):
        """Check if a user's car meets eligibility criteria"""
        if self.open_to_all:
            return True
        
        # Get user's car
        user_car = user.cars.first()  # Assuming user has at least one car
        if not user_car:
            return False
        
        # Check if user's car matches any criteria
        return (
            self.eligible_brands.filter(id=user_car.brand.id).exists() or
            self.eligible_models.filter(id=user_car.model.id).exists() or
            self.eligible_types.filter(id=user_car.car_type.id).exists()
        )


class TripParticipant(models.Model):
    """Trip participation tracking"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'),
    ]
    
    trip = models.ForeignKey(RoadTrip, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trip_participations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timestamps
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Optional participant details
    message = models.TextField(blank=True, help_text="Message from participant")
    emergency_contact = models.CharField(max_length=100, blank=True)
    
    class Meta:
        unique_together = ('trip', 'user')
        ordering = ['joined_at']
    
    def __str__(self):
        return f"{self.user.name} - {self.trip.title} ({self.status})"


class TripNotification(models.Model):
    """Notifications for trip-related events"""
    NOTIFICATION_TYPES = [
        ('new_trip', 'New Trip Available'),
        ('trip_updated', 'Trip Updated'),
        ('trip_cancelled', 'Trip Cancelled'),
        ('join_request', 'Join Request'),
        ('request_approved', 'Request Approved'),
        ('request_declined', 'Request Declined'),
        ('participant_joined', 'New Participant'),
        ('participant_left', 'Participant Left'),
        ('trip_reminder', 'Trip Reminder'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trip_notifications')
    trip = models.ForeignKey(RoadTrip, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Notification metadata
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Related user (e.g., who sent join request)
    related_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='related_notifications',
        blank=True, 
        null=True
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Notification for {self.recipient.name}: {self.title}"
