from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import CustomUser
from cars.models import CarBrand, CarModel, CarVariant, CarType, Car, CarPhoto


class PhotoListField(serializers.Field):
    """Custom field to handle list of uploaded photos"""
    
    def to_internal_value(self, data):
        """Convert uploaded files to internal representation"""
        from django.core.files.uploadedfile import UploadedFile
        
        if not data:
            raise serializers.ValidationError("At least 2 photos are required.")
        
        if not isinstance(data, list):
            data = [data]
        
        if len(data) < 2:
            raise serializers.ValidationError("At least 2 photos are required.")
        
        if len(data) > 5:
            raise serializers.ValidationError("Maximum 5 photos allowed.")
        
        validated_photos = []
        for i, photo in enumerate(data):
            # Check if it's a valid uploaded file
            if not isinstance(photo, UploadedFile):
                raise serializers.ValidationError(f"Photo {i + 1} is not a valid file.")
            
            # Check file size (10MB limit)
            if photo.size > 10 * 1024 * 1024:
                raise serializers.ValidationError(f"Photo {i + 1} is too large. Maximum size is 10MB.")
            
            # Check if it's an image
            if not photo.content_type.startswith('image/'):
                raise serializers.ValidationError(f"Photo {i + 1} must be an image file.")
            
            validated_photos.append(photo)
        
        return validated_photos
    
    def to_representation(self, value):
        """Convert internal value to representation (not needed for write-only field)"""
        return None


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    # Car information fields
    car_brand = serializers.PrimaryKeyRelatedField(queryset=CarBrand.objects.all(), write_only=True)
    car_model = serializers.PrimaryKeyRelatedField(queryset=CarModel.objects.all(), write_only=True)
    car_variant = serializers.PrimaryKeyRelatedField(queryset=CarVariant.objects.all(), write_only=True)
    car_type = serializers.PrimaryKeyRelatedField(queryset=CarType.objects.all(), write_only=True)
    
    # Photos field - use custom field to handle file validation properly
    photos = PhotoListField(write_only=True, required=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'email', 'name', 'phone', 'password', 'password_confirm', 'tier',
            'car_brand', 'car_model', 'car_variant', 'car_type', 'photos'
        ]
        extra_kwargs = {
            'tier': {'required': False}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Password and confirm password do not match.")
        return attrs

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone(self, value):
        if CustomUser.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def validate_car_model(self, value):
        # Ensure the model belongs to the selected brand
        car_brand = self.initial_data.get('car_brand')
        if car_brand and value.brand.id != int(car_brand):
            raise serializers.ValidationError("Selected model does not belong to the selected brand.")
        return value

    def validate_car_variant(self, value):
        # Ensure the variant belongs to the selected model
        car_model = self.initial_data.get('car_model')
        if car_model and value.model.id != int(car_model):
            raise serializers.ValidationError("Selected variant does not belong to the selected model.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        # Extract car and photo data
        car_brand = validated_data.pop('car_brand')
        car_model = validated_data.pop('car_model')
        car_variant = validated_data.pop('car_variant')
        car_type = validated_data.pop('car_type')
        photos_data = validated_data.pop('photos')
        
        # Extract password data
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Create user
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create car registration
        car = Car.objects.create(
            user=user,
            brand=car_brand,
            model=car_model,
            variant=car_variant,
            car_type=car_type
        )
        
        # Create car photos (only if photos were provided)
        for photo in photos_data:
            CarPhoto.objects.create(car=car, photo=photo)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'),
                              username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password')


class UserProfileSerializer(serializers.ModelSerializer):
    cars = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'name', 'phone', 'tier', 'subscription_start', 'subscription_end', 'cars', 'stats']
        read_only_fields = ['id', 'email']

    def get_cars(self, obj):
        from cars.serializers import CarSerializer
        return CarSerializer(obj.cars.all(), many=True).data
    
    def get_stats(self, obj):
        # Calculate user stats dynamically
        from roadtrips.models import RoadTrip
        from datetime import datetime, timedelta
        from django.utils import timezone
        
        # Calculate current month's trip count
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        monthly_trips = RoadTrip.objects.filter(
            organizer=obj,
            created_at__gte=start_of_month
        ).count()
        
        return {
            'monthlyTrips': monthly_trips,
            'notificationsReceived': 0,  # TODO: Implement notification tracking
            'points': 0,  # TODO: Implement points system
        }


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['name', 'phone']

    def validate_phone(self, value):
        user = self.instance
        if CustomUser.objects.filter(phone=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New password and confirm password do not match.")
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value