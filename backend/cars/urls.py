from django.urls import path
from . import views

app_name = 'cars'

urlpatterns = [
    # Car data endpoints (for dropdowns and registration)
    path('brands/', views.get_car_brands, name='brands'),
    path('brands-with-models/', views.get_car_brands_with_models, name='brands_with_models'),
    path('brands/<int:brand_id>/models/', views.get_models_for_brand, name='models_for_brand'),
    path('models/<int:model_id>/variants/', views.get_variants_for_model, name='variants_for_model'),
    path('types/', views.get_car_types, name='car_types'),
    
    # User car management endpoints
    path('my-cars/', views.get_user_cars, name='user_cars'),
    path('register/', views.register_car, name='register_car'),
    path('<int:car_id>/', views.get_car_detail, name='car_detail'),
    path('<int:car_id>/update/', views.update_car, name='update_car'),
    path('<int:car_id>/delete/', views.delete_car, name='delete_car'),
    
    # Photo management endpoints
    path('<int:car_id>/photos/add/', views.add_car_photos, name='add_car_photos'),
    path('<int:car_id>/photos/<int:photo_id>/delete/', views.delete_car_photo, name='delete_car_photo'),
]