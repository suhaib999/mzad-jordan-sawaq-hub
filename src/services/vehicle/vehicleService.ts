
import { supabase } from '@/integrations/supabase/client';
import { VehicleFormValues } from '@/types/product';
import { createOrUpdateProduct } from '@/services/product/createOrUpdateProduct';
import { toast } from '@/hooks/use-toast';

export async function createVehicleListing(
  vehicleData: VehicleFormValues, 
  userId: string
): Promise<{ success: boolean; vehicleId?: string; productId?: string; error?: string }> {
  try {
    // 1. First create a general product
    const productData = {
      title: vehicleData.title,
      description: vehicleData.description,
      category: 'vehicles',
      subcategory: 'vehicles/cars',
      category_path: vehicleData.category_path || ['vehicles', 'cars'],
      condition: vehicleData.condition,
      price: vehicleData.price,
      is_negotiable: vehicleData.is_negotiable,
      quantity: 1,
      listing_type: 'fixed_price',
      location: vehicleData.location,
      status: vehicleData.status,
      images: vehicleData.images,
      attributes: {
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        mileage: vehicleData.mileage,
      }
    };
    
    // Create or update the product
    const { success, productId, error } = await createOrUpdateProduct(productData, vehicleData.images, userId);
    
    if (!success || !productId) {
      return { success: false, error: error || 'Failed to create product listing' };
    }
    
    // 2. Then create the vehicle specific entry
    const vehicleToInsert = {
      product_id: productId,
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      mileage: vehicleData.mileage,
      engine_size: vehicleData.engine_size,
      fuel_type: vehicleData.fuel_type,
      transmission: vehicleData.transmission,
      body_type: vehicleData.body_type,
      color: vehicleData.color,
      doors: vehicleData.doors,
      seats: vehicleData.seats,
      drive_type: vehicleData.drive_type,
      cylinders: vehicleData.cylinders,
      wheel_side: vehicleData.wheel_side,
      interior_color: vehicleData.interior_color,
      license_status: vehicleData.license_status,
      chassis_number: vehicleData.chassis_number,
      condition: vehicleData.condition,
      features: vehicleData.features || []
    };
    
    const { data: vehicleRecord, error: vehicleError } = await supabase
      .from('vehicles')
      .insert(vehicleToInsert)
      .select('id')
      .single();
      
    if (vehicleError) {
      console.error('Error creating vehicle record:', vehicleError);
      
      // Attempt to delete the product since the vehicle creation failed
      await supabase
        .from('products')
        .delete()
        .match({ id: productId });
        
      return { success: false, error: `Failed to create vehicle: ${vehicleError.message}` };
    }
    
    return {
      success: true,
      vehicleId: vehicleRecord.id,
      productId
    };
  } catch (error: any) {
    console.error('Error in createVehicleListing:', error);
    return {
      success: false,
      error: error?.message || 'Failed to create vehicle listing'
    };
  }
}

export async function updateVehicleListing(
  vehicleId: string,
  productId: string,
  vehicleData: VehicleFormValues,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Update the product data
    const productData = {
      id: productId,
      title: vehicleData.title,
      description: vehicleData.description,
      condition: vehicleData.condition,
      price: vehicleData.price,
      is_negotiable: vehicleData.is_negotiable,
      location: vehicleData.location,
      status: vehicleData.status,
      images: vehicleData.images,
      attributes: {
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        mileage: vehicleData.mileage,
      }
    };
    
    const { success, error } = await createOrUpdateProduct(productData, vehicleData.images, userId);
    
    if (!success) {
      return { success: false, error: error || 'Failed to update product listing' };
    }
    
    // 2. Update the vehicle specific entry
    const vehicleToUpdate = {
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      mileage: vehicleData.mileage,
      engine_size: vehicleData.engine_size,
      fuel_type: vehicleData.fuel_type,
      transmission: vehicleData.transmission,
      body_type: vehicleData.body_type,
      color: vehicleData.color,
      doors: vehicleData.doors,
      seats: vehicleData.seats,
      drive_type: vehicleData.drive_type,
      cylinders: vehicleData.cylinders,
      wheel_side: vehicleData.wheel_side,
      interior_color: vehicleData.interior_color,
      license_status: vehicleData.license_status,
      chassis_number: vehicleData.chassis_number,
      condition: vehicleData.condition,
      features: vehicleData.features || [],
      updated_at: new Date().toISOString()
    };
    
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .update(vehicleToUpdate)
      .eq('id', vehicleId);
      
    if (vehicleError) {
      console.error('Error updating vehicle record:', vehicleError);
      return { success: false, error: `Failed to update vehicle: ${vehicleError.message}` };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error in updateVehicleListing:', error);
    return {
      success: false,
      error: error?.message || 'Failed to update vehicle listing'
    };
  }
}

export async function getVehicleByProductId(productId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('product_id', productId)
      .single();
      
    if (error) {
      console.error('Error fetching vehicle:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getVehicleByProductId:', error);
    return null;
  }
}
