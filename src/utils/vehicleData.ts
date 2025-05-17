
import carData from '@/cars.txt';

export interface CarModel {
  name: string;
}

export interface CarMake {
  name: string;
  models: CarModel[];
}

export const parseCarData = (): CarMake[] => {
  const cars: CarMake[] = [];
  let currentMake: CarMake | null = null;

  // Split the file by lines
  const lines = carData.split('\n');

  for (let line of lines) {
    line = line.trim();
    
    // Skip empty lines
    if (!line) continue;

    // Check if this is a make (starts with ##)
    if (line.startsWith('##')) {
      const makeName = line.replace('##', '').trim();
      currentMake = { name: makeName, models: [] };
      cars.push(currentMake);
    } 
    // Check if this is a model (starts with -)
    else if (line.startsWith('-') && currentMake) {
      const modelName = line.replace('-', '').trim();
      currentMake.models.push({ name: modelName });
    }
  }

  // Sort makes alphabetically
  return cars.sort((a, b) => a.name.localeCompare(b.name));
};

export const getCarMakes = (): string[] => {
  return parseCarData().map(make => make.name);
};

export const getCarModels = (makeName: string): string[] => {
  const make = parseCarData().find(make => make.name === makeName);
  return make ? make.models.map(model => model.name) : [];
};

// Vehicle attributes
export const fuelTypes = [
  'Gasoline', 
  'Diesel', 
  'Electric', 
  'Hybrid', 
  'Plug-in Hybrid', 
  'CNG', 
  'LPG',
  'Other'
];

export const transmissionTypes = [
  'Automatic', 
  'Manual', 
  'Semi-Automatic', 
  'CVT', 
  'DCT',
  'Other'
];

export const bodyTypes = [
  'Sedan', 
  'SUV', 
  'Hatchback', 
  'Coupe', 
  'Convertible', 
  'Truck', 
  'Van/Minivan', 
  'Wagon',
  'Pickup',
  'Crossover',
  'Other'
];

export const driveTypes = [
  'FWD (Front-Wheel Drive)',
  'RWD (Rear-Wheel Drive)',
  'AWD (All-Wheel Drive)',
  '4WD (Four-Wheel Drive)',
  'Other'
];

export const wheelSides = [
  'Left-Hand Drive',
  'Right-Hand Drive'
];

export const licenseStatuses = [
  'Fully Licensed',
  'Temporary License',
  'Not Licensed',
  'Expired License',
  'Other'
];

export const colorOptions = [
  'Black', 
  'White', 
  'Silver', 
  'Gray', 
  'Blue', 
  'Red', 
  'Green', 
  'Brown', 
  'Beige',
  'Yellow', 
  'Orange', 
  'Purple', 
  'Gold',
  'Other'
];

export const featureOptions = [
  { id: 'air_conditioning', label: 'Air Conditioning' },
  { id: 'power_steering', label: 'Power Steering' },
  { id: 'power_windows', label: 'Power Windows' },
  { id: 'abs', label: 'Anti-lock Brakes (ABS)' },
  { id: 'airbags', label: 'Airbags' },
  { id: 'sunroof', label: 'Sunroof' },
  { id: 'leather_seats', label: 'Leather Seats' },
  { id: 'navigation', label: 'Navigation System' },
  { id: 'bluetooth', label: 'Bluetooth' },
  { id: 'backup_camera', label: 'Backup Camera' },
  { id: 'parking_sensors', label: 'Parking Sensors' },
  { id: 'cruise_control', label: 'Cruise Control' },
  { id: 'heated_seats', label: 'Heated Seats' },
  { id: 'keyless_entry', label: 'Keyless Entry' },
  { id: 'push_start', label: 'Push Button Start' },
  { id: 'third_row_seating', label: 'Third Row Seating' },
  { id: 'tow_package', label: 'Tow Package' },
  { id: 'panoramic_roof', label: 'Panoramic Roof' },
  { id: 'premium_sound', label: 'Premium Sound System' },
  { id: 'adaptive_cruise', label: 'Adaptive Cruise Control' },
  { id: 'lane_assist', label: 'Lane Keeping Assist' },
  { id: 'blind_spot', label: 'Blind Spot Monitor' }
];
