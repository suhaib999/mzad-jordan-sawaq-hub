import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import MapLocationPicker from './MapLocationPicker';

// List of Jordanian cities for the dropdown
const jordanianCities = [
  "Ajloun",
  "Al Karak",
  "Amman",
  "Aqaba",
  "Irbid",
  "Jerash",
  "Jordan Valley",
  "Ma'an",
  "Madaba",
  "Mafraq",
  "Ramtha",
  "Salt",
  "Tafila",
  "Zarqa"
];

const formSchema = z.object({
  street_address: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  neighborhood: z.string().min(2, "Neighborhood is required"),
  postal_code: z.string().min(2, "Postal/ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddBusinessAddressFormProps {
  open: boolean;
  onClose: () => void;
}

const AddBusinessAddressForm = ({ open, onClose }: AddBusinessAddressFormProps) => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [showMap, setShowMap] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      street_address: "",
      city: "",
      neighborhood: "",
      postal_code: "",
      country: "Jordan", // Default to Jordan
      latitude: "",
      longitude: "",
    }
  });

  const onSubmit = async (data: FormValues) => {
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
            <FormField
              control={form.control}
              name="street_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {jordanianCities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neighborhood</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter neighborhood" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal/ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter postal/ZIP code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-sm font-medium">Map Location</h3>
                <p className="text-sm text-muted-foreground">
                  {form.watch("latitude") && form.watch("longitude") 
                    ? `Location set: ${form.watch("latitude")}, ${form.watch("longitude")}` 
                    : "No location set"}
                </p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setShowMap(true)}
                className="flex items-center gap-1"
              >
                <MapPin className="h-4 w-4" />
                Set on Map
              </Button>
            </div>
            
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
