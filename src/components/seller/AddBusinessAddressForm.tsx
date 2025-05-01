
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormDescription,
} from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import MapLocationPicker from './MapLocationPicker';
import AddressFormFields from './address/AddressFormFields';
import { addressFormSchema, AddressFormValues, defaultAddressFormValues } from './address/addressFormSchema';

interface AddBusinessAddressFormProps {
  open: boolean;
  onClose: () => void;
}

const AddBusinessAddressForm = ({ open, onClose }: AddBusinessAddressFormProps) => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [showMap, setShowMap] = useState(false);
  
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: defaultAddressFormValues
  });

  const onSubmit = async (data: AddressFormValues) => {
    if (!user) return;
    
    try {
      // Format address as a single string to store in user metadata
      const formattedAddress = `${data.street_address}, ${data.city}, ${data.neighborhood} ${data.postal_code}, ${data.country}`;
      
      // Update user metadata
      const { data: updateData, error } = await supabase.auth.updateUser({
        data: {
          business_address: formattedAddress,
          business_location: data.latitude && data.longitude ? 
            { latitude: data.latitude, longitude: data.longitude } : null
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Also update the profile in the profiles table
      await updateProfile(user.id, {
        address: formattedAddress,
      });
      
      // Refresh the user data
      await refreshUser();
      
      toast({
        title: "Business address added",
        description: "Your business address has been successfully added.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error adding business address:", error);
      toast({
        title: "Update failed",
        description: "There was a problem adding your business address.",
        variant: "destructive",
      });
    }
  };

  // Handle location selection from map
  const handleLocationSelected = (lat: string, lng: string) => {
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
    setShowMap(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Business Address</DialogTitle>
          <DialogDescription>Enter your business address details below</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AddressFormFields 
              form={form} 
              onMapOpen={() => setShowMap(true)} 
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Address</Button>
            </DialogFooter>
          </form>
        </Form>
        
        {showMap && (
          <MapLocationPicker 
            isOpen={showMap} 
            onClose={() => setShowMap(false)}
            onLocationSelected={handleLocationSelected}
            initialLocation={{
              lat: form.watch("latitude") ? parseFloat(form.watch("latitude")) : 31.9539, // Default to Jordan
              lng: form.watch("longitude") ? parseFloat(form.watch("longitude")) : 35.9106
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddBusinessAddressForm;
