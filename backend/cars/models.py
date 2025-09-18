from django.db import models
from .models import CustomUser

# Models 
class CarBrand(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class CarModel(models.Model):
    brand = models.ForeignKey(CarBrand, related_name="models", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ("brand", "name")

    def __str__(self):
        return f"{self.brand.name} {self.name}"


class CarVariant(models.Model):
    model = models.ForeignKey(CarModel, related_name="variants", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ("model", "name")

    def __str__(self):
        return f"{self.model} {self.name}"


class CarType(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# -------------------------
# Car registered by user
# -------------------------
class Car(models.Model):
    user = models.ForeignKey(CustomUser, related_name="cars", on_delete=models.CASCADE)
    brand = models.ForeignKey(CarBrand, on_delete=models.SET_NULL, null=True)
    model = models.ForeignKey(CarModel, on_delete=models.SET_NULL, null=True, blank=True)
    variant = models.ForeignKey(CarVariant, on_delete=models.SET_NULL, null=True, blank=True)
    car_type = models.ForeignKey(CarType, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.brand} {self.model or ''}".strip()


class CarPhoto(models.Model):
    car = models.ForeignKey(Car, related_name="photos", on_delete=models.CASCADE)
    photo = models.ImageField(upload_to="car_photos/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.car}"