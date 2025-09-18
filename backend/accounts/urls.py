from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    
    # User profile endpoints
    path('profile/', views.get_user_profile, name='profile'),
    path('profile/update/', views.update_user_profile, name='profile_update'),
    path('change-password/', views.change_password, name='change_password'),
    
    # Utility endpoints
    path('check-email/', views.check_email_availability, name='check_email'),
    path('check-phone/', views.check_phone_availability, name='check_phone'),
]