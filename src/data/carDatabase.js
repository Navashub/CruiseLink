// Car database with hierarchical structure: Brand > Model > Variants
export const carDatabase = {
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

// Car types/categories
export const carTypes = [
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

// Helper functions
export const getAllBrands = () => Object.keys(carDatabase)

export const getModelsForBrand = (brand) => {
  return brand ? Object.keys(carDatabase[brand] || {}) : []
}

export const getVariantsForModel = (brand, model) => {
  return (brand && model) ? (carDatabase[brand]?.[model] || []) : []
}

export const getAllModelsFlat = () => {
  const allModels = []
  Object.keys(carDatabase).forEach(brand => {
    Object.keys(carDatabase[brand]).forEach(model => {
      carDatabase[brand][model].forEach(variant => {
        allModels.push({
          brand,
          model,
          variant,
          fullName: `${brand} ${variant}`
        })
      })
    })
  })
  return allModels
}