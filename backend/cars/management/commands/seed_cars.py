from django.core.management.base import BaseCommand
from cars.models import CarBrand, CarModel, CarVariant, CarType


class Command(BaseCommand):
    help = 'Seed car database with mockup data from frontend'

    def handle(self, *args, **options):
        self.stdout.write('Starting to seed car database...')

        # Car database from frontend
        car_database = {
            'Audi': {
                'A4': ['A4', 'S4', 'RS4'],
                'A6': ['A6', 'S6', 'RS6'],
                'Q5': ['Q5', 'SQ5', 'Q5 Sportback'],
                'Q7': ['Q7', 'SQ7'],
                'A3': ['A3', 'S3', 'RS3'],
                'Q3': ['Q3', 'RSQ3']
            },
            'BMW': {
                '3 Series': ['320i', '330i', '340i', 'M3'],
                '5 Series': ['520i', '530i', '540i', 'M5'],
                'X3': ['X3', 'X3 M'],
                'X5': ['X5', 'X5 M'],
                'Z4': ['Z4', 'Z4 M'],
                'i4': ['i4', 'i4 M50']
            },
            'Mercedes': {
                'C-Class': ['C200', 'C300', 'AMG C43', 'AMG C63'],
                'E-Class': ['E200', 'E300', 'AMG E43', 'AMG E63'],
                'GLC': ['GLC200', 'GLC300', 'AMG GLC43', 'AMG GLC63'],
                'GLE': ['GLE350', 'GLE450', 'AMG GLE53', 'AMG GLE63'],
                'A-Class': ['A200', 'A250', 'AMG A35', 'AMG A45']
            },
            'Toyota': {
                'Camry': ['Camry LE', 'Camry XLE', 'Camry XSE', 'Camry TRD'],
                'Corolla': ['Corolla L', 'Corolla LE', 'Corolla XLE', 'Corolla Hatchback'],
                'Prius': ['Prius L', 'Prius LE', 'Prius XLE', 'Prius Prime'],
                'RAV4': ['RAV4 LE', 'RAV4 XLE', 'RAV4 TRD', 'RAV4 Prime'],
                'Highlander': ['Highlander L', 'Highlander LE', 'Highlander XLE', 'Highlander Platinum'],
                'Supra': ['Supra 2.0', 'Supra 3.0', 'Supra 3.0 Premium']
            },
            'Honda': {
                'Civic': ['Civic LX', 'Civic EX', 'Civic Touring', 'Civic Type R'],
                'Accord': ['Accord LX', 'Accord EX', 'Accord Touring', 'Accord Hybrid'],
                'CR-V': ['CR-V LX', 'CR-V EX', 'CR-V Touring', 'CR-V Hybrid'],
                'Pilot': ['Pilot LX', 'Pilot EX', 'Pilot Touring', 'Pilot Elite'],
                'HR-V': ['HR-V LX', 'HR-V EX', 'HR-V EX-L']
            },
            'Ford': {
                'F-150': ['F-150 Regular Cab', 'F-150 SuperCab', 'F-150 SuperCrew', 'F-150 Lightning'],
                'Mustang': ['Mustang EcoBoost', 'Mustang GT', 'Mustang Mach 1', 'Mustang Shelby GT500'],
                'Explorer': ['Explorer Base', 'Explorer XLT', 'Explorer Limited', 'Explorer ST'],
                'Escape': ['Escape S', 'Escape SE', 'Escape Titanium', 'Escape Hybrid'],
                'Bronco': ['Bronco Base', 'Bronco Big Bend', 'Bronco Outer Banks', 'Bronco Wildtrak']
            },
            'Chevrolet': {
                'Camaro': ['Camaro LS', 'Camaro LT', 'Camaro SS', 'Camaro ZL1'],
                'Corvette': ['Corvette Stingray', 'Corvette Z06', 'Corvette ZR1'],
                'Tahoe': ['Tahoe LS', 'Tahoe LT', 'Tahoe RST', 'Tahoe High Country'],
                'Silverado': ['Silverado Work Truck', 'Silverado LT', 'Silverado RST', 'Silverado High Country'],
                'Malibu': ['Malibu L', 'Malibu LS', 'Malibu LT', 'Malibu Premier']
            }
        }

        # Car types from frontend
        car_types = [
            'Sedan',
            'SUV',
            'Hatchback',
            'Truck',
            'Sports Car',
            'Coupe',
            'Convertible',
            'Van',
            'Electric',
            'Hybrid'
        ]

        # Create car types
        self.stdout.write('Creating car types...')
        for car_type_name in car_types:
            car_type, created = CarType.objects.get_or_create(name=car_type_name)
            if created:
                self.stdout.write(f'Created car type: {car_type_name}')

        # Create brands, models, and variants
        brands_created = 0
        models_created = 0
        variants_created = 0

        for brand_name, models_dict in car_database.items():
            # Create or get brand
            brand, brand_created = CarBrand.objects.get_or_create(name=brand_name)
            if brand_created:
                brands_created += 1
                self.stdout.write(f'Created brand: {brand_name}')

            for model_name, variants_list in models_dict.items():
                # Create or get model
                model, model_created = CarModel.objects.get_or_create(
                    brand=brand,
                    name=model_name
                )
                if model_created:
                    models_created += 1
                    self.stdout.write(f'Created model: {brand_name} {model_name}')

                for variant_name in variants_list:
                    # Create or get variant
                    variant, variant_created = CarVariant.objects.get_or_create(
                        model=model,
                        name=variant_name
                    )
                    if variant_created:
                        variants_created += 1
                        self.stdout.write(f'Created variant: {brand_name} {model_name} {variant_name}')

        # Summary
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully seeded car database!\n'
                f'Created: {brands_created} brands, {models_created} models, {variants_created} variants\n'
                f'Total car types: {CarType.objects.count()}\n'
                f'Total brands: {CarBrand.objects.count()}\n'
                f'Total models: {CarModel.objects.count()}\n'
                f'Total variants: {CarVariant.objects.count()}'
            )
        )