from django.apps import AppConfig


class RoadtripsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'roadtrips'
    
    def ready(self):
        import roadtrips.signals
