from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import RoadTrip, TripNotification, TripParticipant

User = get_user_model()


@receiver(post_save, sender=RoadTrip)
def send_new_trip_notifications(sender, instance, created, **kwargs):
    """
    Send notifications to eligible users when a new trip is created
    """
    if created and instance.status == 'published':
        # Get all users who might be eligible for this trip
        eligible_users = []
        
        if hasattr(instance, 'eligibility'):
            eligibility = instance.eligibility
            
            if eligibility.open_to_all:
                # If open to all, notify all users except the organizer
                eligible_users = User.objects.exclude(id=instance.organizer.id)
            else:
                # Find users with cars that match eligibility criteria
                eligible_user_ids = set()
                
                # Check brand eligibility
                if eligibility.eligible_brands.exists():
                    brand_eligible_users = User.objects.filter(
                        cars__brand__in=eligibility.eligible_brands.all()
                    ).values_list('id', flat=True)
                    eligible_user_ids.update(brand_eligible_users)
                
                # Check model eligibility
                if eligibility.eligible_models.exists():
                    model_eligible_users = User.objects.filter(
                        cars__model__in=eligibility.eligible_models.all()
                    ).values_list('id', flat=True)
                    eligible_user_ids.update(model_eligible_users)
                
                # Check type eligibility
                if eligibility.eligible_types.exists():
                    type_eligible_users = User.objects.filter(
                        cars__car_type__in=eligibility.eligible_types.all()
                    ).values_list('id', flat=True)
                    eligible_user_ids.update(type_eligible_users)
                
                # Get user objects and exclude organizer
                eligible_users = User.objects.filter(
                    id__in=eligible_user_ids
                ).exclude(id=instance.organizer.id)
        else:
            # No eligibility criteria set, notify all users except organizer
            eligible_users = User.objects.exclude(id=instance.organizer.id)
        
        # Create notifications for eligible users
        notifications_to_create = []
        for user in eligible_users:
            notifications_to_create.append(
                TripNotification(
                    recipient=user,
                    trip=instance,
                    notification_type='new_trip',
                    title=f"New trip available: {instance.title}",
                    message=f"A new trip to {instance.destination} has been organized by {instance.organizer.name}. Check if you're interested in joining!",
                    related_user=instance.organizer
                )
            )
        
        # Batch create notifications for performance
        if notifications_to_create:
            TripNotification.objects.bulk_create(notifications_to_create)


@receiver(post_save, sender=RoadTrip)
def send_trip_update_notifications(sender, instance, created, **kwargs):
    """
    Send notifications to participants when trip details are updated
    """
    if not created:  # Only for updates, not creation
        # Get all confirmed participants
        participants = User.objects.filter(
            trip_participations__trip=instance,
            trip_participations__status='confirmed'
        ).exclude(id=instance.organizer.id)
        
        # Create update notifications
        notifications_to_create = []
        for participant in participants:
            notifications_to_create.append(
                TripNotification(
                    recipient=participant,
                    trip=instance,
                    notification_type='trip_updated',
                    title=f"Trip updated: {instance.title}",
                    message=f"The trip '{instance.title}' has been updated by the organizer. Please check the latest details.",
                    related_user=instance.organizer
                )
            )
        
        # Batch create notifications
        if notifications_to_create:
            TripNotification.objects.bulk_create(notifications_to_create)


@receiver(post_save, sender=TripParticipant)
def send_participation_notifications(sender, instance, created, **kwargs):
    """
    Send notifications when someone joins or changes participation status
    """
    if created:
        # New participant joined - notification already handled in view
        pass
    else:
        # Participation status changed - notification already handled in view
        pass


# Additional utility function to send trip reminders
def send_trip_reminders():
    """
    Utility function to send trip reminders
    This can be called by a scheduled task (e.g., Celery) to send reminders
    """
    from django.utils import timezone
    from datetime import timedelta
    
    # Find trips starting in 24 hours
    tomorrow = timezone.now() + timedelta(hours=24)
    upcoming_trips = RoadTrip.objects.filter(
        departure_date__date=tomorrow.date(),
        status='published'
    )
    
    notifications_to_create = []
    
    for trip in upcoming_trips:
        # Send reminders to all confirmed participants
        participants = User.objects.filter(
            trip_participations__trip=trip,
            trip_participations__status='confirmed'
        )
        
        for participant in participants:
            notifications_to_create.append(
                TripNotification(
                    recipient=participant,
                    trip=trip,
                    notification_type='trip_reminder',
                    title=f"Trip reminder: {trip.title}",
                    message=f"Your trip '{trip.title}' starts tomorrow at {trip.departure_date.strftime('%I:%M %p')}. Meeting point: {trip.meeting_point}",
                    related_user=trip.organizer
                )
            )
    
    # Batch create reminder notifications
    if notifications_to_create:
        TripNotification.objects.bulk_create(notifications_to_create)
    
    return len(notifications_to_create)