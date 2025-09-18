from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import CarBrand, CarModel, CarVariant, CarType, Car
from .serializers import (
    CarBrandSerializer, 
    CarBrandWithModelsSerializer,
    CarModelSerializer,
    CarVariantSerializer,
    CarTypeSerializer,
    CarSerializer,
    CarCreateSerializer
)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_car_brands(request):
    """
    Get all car brands
    """
    brands = CarBrand.objects.all().order_by('name')
    serializer = CarBrandSerializer(brands, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_car_brands_with_models(request):
    """
    Get all car brands with their models
    """
    brands = CarBrand.objects.prefetch_related('models').all().order_by('name')
    serializer = CarBrandWithModelsSerializer(brands, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_models_for_brand(request, brand_id):
    """
    Get all models for a specific brand
    """
    try:
        brand = CarBrand.objects.get(id=brand_id)
        models = CarModel.objects.filter(brand=brand).prefetch_related('variants').order_by('name')
        serializer = CarModelSerializer(models, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except CarBrand.DoesNotExist:
        return Response({'error': 'Brand not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_variants_for_model(request, model_id):
    """
    Get all variants for a specific model
    """
    try:
        model = CarModel.objects.get(id=model_id)
        variants = CarVariant.objects.filter(model=model).order_by('name')
        serializer = CarVariantSerializer(variants, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except CarModel.DoesNotExist:
        return Response({'error': 'Model not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_car_types(request):
    """
    Get all car types
    """
    car_types = CarType.objects.all().order_by('name')
    serializer = CarTypeSerializer(car_types, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_cars(request):
    """
    Get all cars registered by the current user
    """
    cars = Car.objects.filter(user=request.user).select_related(
        'brand', 'model', 'variant', 'car_type'
    ).prefetch_related('photos')
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def register_car(request):
    """
    Register a new car for the current user
    """
    serializer = CarCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        car = serializer.save()
        response_serializer = CarSerializer(car)
        return Response({
            'message': 'Car registered successfully',
            'car': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_car_detail(request, car_id):
    """
    Get details of a specific car
    """
    try:
        car = Car.objects.select_related(
            'brand', 'model', 'variant', 'car_type', 'user'
        ).prefetch_related('photos').get(id=car_id, user=request.user)
        serializer = CarSerializer(car)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_car(request, car_id):
    """
    Update a car registration
    """
    try:
        car = Car.objects.get(id=car_id, user=request.user)
        serializer = CarCreateSerializer(
            car, 
            data=request.data, 
            partial=request.method == 'PATCH',
            context={'request': request}
        )
        if serializer.is_valid():
            car = serializer.save()
            response_serializer = CarSerializer(car)
            return Response({
                'message': 'Car updated successfully',
                'car': response_serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_car(request, car_id):
    """
    Delete a car registration
    """
    try:
        car = Car.objects.get(id=car_id, user=request.user)
        car.delete()
        return Response({
            'message': 'Car deleted successfully'
        }, status=status.HTTP_200_OK)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)
