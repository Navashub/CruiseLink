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
    class Meta:
        model = Car
        fields = ['brand', 'model', 'variant', 'car_type']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)