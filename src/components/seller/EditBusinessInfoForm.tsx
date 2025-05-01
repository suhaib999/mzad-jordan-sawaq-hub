import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const formSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  business_type: z.string().min(1, "Please select a business type"),
  tax_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditBusinessInfoFormProps {
  open: boolean;
  onClose: () => void;
  defaultValues?: {
    business_name?: string;
    business_type?: string;
    tax_id?: string;
  };
}

const EditBusinessInfoForm = ({ open, onClose, defaultValues }: EditBusinessInfoFormProps) => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_name: defaultValues?.business_name || user?.user_metadata?.full_name || "",
      business_type: defaultValues?.business_type || "individual",
      tax_id: defaultValues?.tax_id || "",
    }
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    try {
      // Update user metadata
      const { data: updateData, error } = await supabase.auth.updateUser({
        data: {
          full_name: data.business_name,
          business_type: data.business_type,
          tax_id: data.tax_id || null,
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Also update the profile in the profiles table to keep data in sync
      await updateProfile(user.id, {
        full_name: data.business_name,
      });
      
      // Refresh the user to get updated metadata
      await refreshUser();
      
      toast({
        title: "Business information updated",
        description: "Your business information has been successfully updated.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating business information:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your business information.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Business Information</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your business name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="business_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="individual">Individual Seller</SelectItem>
                      <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tax_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your tax ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBusinessInfoForm;
