import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ProfileUpdateData, updateProfile } from '@/services/profileService';
import { MapPin } from 'lucide-react';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  userId: string;
  initialValues: {
    username: string;
    full_name: string;
    phone_number?: string;
    address?: string;
    location?: string;
  };
  onSuccess?: () => void;
}

export function ProfileForm({ userId, initialValues, onSuccess }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: initialValues.username || '',
      full_name: initialValues.full_name || '',
      phone_number: initialValues.phone_number || '',
      address: initialValues.address || '',
      location: initialValues.location || '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const success = await updateProfile(userId, values as ProfileUpdateData);
      
      if (success) {
        toast.success({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.destructive({
          title: 'Update failed',
          description: 'Could not update your profile. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.destructive({
        title: 'Update failed',
        description: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="City, Country (e.g., Amman, Jordan)" />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Your general location will be visible on your listings
              </p>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
