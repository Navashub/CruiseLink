from rest_framework import serializers
from .models import CarBrand, CarModel, CarVariant, CarType, Car, CarPhoto


class CarTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarType
        fields = ['id', 'name']


class CarBrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarBrand
        fields = ['id', 'name']


class CarVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarVariant
        fields = ['id', 'name']


class CarModelSerializer(serializers.ModelSerializer):
    variants = CarVariantSerializer(many=True, read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    
    class Meta:
        model = CarModel
        fields = ['id', 'name', 'brand', 'brand_name', 'variants']


class CarModelSimpleSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    
    class Meta:
        model = CarModel
        fields = ['id', 'name', 'brand', 'brand_name']


class CarBrandWithModelsSerializer(serializers.ModelSerializer):
    models = CarModelSimpleSerializer(many=True, read_only=True)
    
    class Meta:
        model = CarBrand
        fields = ['id', 'name', 'models']


class CarPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarPhoto
        fields = ['id', 'photo', 'uploaded_at']


class CarSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    variant_name = serializers.CharField(source='variant.name', read_only=True)
    car_type_name = serializers.CharField(source='car_type.name', read_only=True)
    photos = CarPhotoSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Car
        fields = [
            'id', 'user', 'user_name', 'user_email',
            'brand', 'brand_name', 'model', 'model_name', 
            'variant', 'variant_name', 'car_type', 'car_type_name',
            'photos'
        ]
        read_only_fields = ['user']


class CarCreateSerializer(serializers.ModelSerializer):
    photos = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=True,
        min_length=2,
        max_length=5
    )
    
    class Meta:
        model = Car
        fields = ['brand', 'model', 'variant', 'car_type', 'photos']

    def validate_photos(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Please upload at least 2 photos of your car.")
        if len(value) > 5:
            raise serializers.ValidationError("You can upload maximum 5 photos.")
        
        # Validate file size (10MB max per file)
        for photo in value:
            if photo.size > 10 * 1024 * 1024:  # 10MB
                raise serializers.ValidationError(f"Photo {photo.name} is too large. Maximum size is 10MB.")
        
        return value

    def create(self, validated_data):
        photos_data = validated_data.pop('photos')
        validated_data['user'] = self.context['request'].user
        car = super().create(validated_data)
        
        # Create car photos
        for photo in photos_data:
            CarPhoto.objects.create(car=car, photo=photo)
        
        return car


class CarUpdateSerializer(serializers.ModelSerializer):
    photos = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        min_length=2,
        max_length=5
    )
    
    class Meta:
        model = Car
        fields = ['brand', 'model', 'variant', 'car_type', 'photos']

    def validate_photos(self, value):
        if value and len(value) < 2:
            raise serializers.ValidationError("Please upload at least 2 photos of your car.")
        if value and len(value) > 5:
            raise serializers.ValidationError("You can upload maximum 5 photos.")
        
        # Validate file size (10MB max per file)
        if value:
            for photo in value:
                if photo.size > 10 * 1024 * 1024:  # 10MB
                    raise serializers.ValidationError(f"Photo {photo.name} is too large. Maximum size is 10MB.")
        
        return value

    def update(self, instance, validated_data):
        photos_data = validated_data.pop('photos', None)
        instance = super().update(instance, validated_data)
        
        # Update car photos if provided
        if photos_data is not None:
            # Delete existing photos
            instance.photos.all().delete()
            # Create new photos
            for photo in photos_data:
                CarPhoto.objects.create(car=instance, photo=photo)
        
        return instance