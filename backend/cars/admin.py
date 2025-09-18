from django.contrib import admin
from .models import CarBrand, CarModel, CarVariant, CarType, Car, CarPhoto


@admin.register(CarBrand)
class CarBrandAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
    ordering = ['name']


@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand']
    list_filter = ['brand']
    search_fields = ['name', 'brand__name']
    ordering = ['brand__name', 'name']


@admin.register(CarVariant)
class CarVariantAdmin(admin.ModelAdmin):
    list_display = ['name', 'model', 'get_brand']
    list_filter = ['model__brand']
    search_fields = ['name', 'model__name', 'model__brand__name']
    ordering = ['model__brand__name', 'model__name', 'name']
    
    def get_brand(self, obj):
        return obj.model.brand.name
    get_brand.short_description = 'Brand'


@admin.register(CarType)
class CarTypeAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
    ordering = ['name']


class CarPhotoInline(admin.TabularInline):
    model = CarPhoto
    extra = 0
    readonly_fields = ['uploaded_at']


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'user', 'brand', 'model', 'variant', 'car_type', 'photo_count']
    list_filter = ['brand', 'car_type']
    search_fields = ['user__name', 'user__email', 'brand__name', 'model__name']
    inlines = [CarPhotoInline]
    ordering = ['-id']
    
    def photo_count(self, obj):
        return obj.photos.count()
    photo_count.short_description = 'Photos'


@admin.register(CarPhoto)
class CarPhotoAdmin(admin.ModelAdmin):
    list_display = ['id', 'car', 'uploaded_at']
    list_filter = ['uploaded_at', 'car__brand']
    search_fields = ['car__user__name', 'car__brand__name']
    ordering = ['-uploaded_at']
