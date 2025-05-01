
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

type ProfileType = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  phone_number: string | null;
  address: string | null;
};

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone_number: '',
    address: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          username: data.username || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
        });
      } catch (error: any) {
        toast({
          title: 'Error fetching profile',
          description: error.message || 'Could not load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          phone_number: formData.phone_number,
          address: formData.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      // Update the profile state
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          full_name: formData.full_name,
          username: formData.username,
          phone_number: formData.phone_number,
          address: formData.address,
        };
      });
      
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message || 'Could not update profile',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!authLoading && !user) {
    return <Navigate to="/auth/login" />;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center min-h-[60vh]">
            <p>Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{profile?.full_name || profile?.username}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="bg-mzad-secondary hover:bg-mzad-secondary/90"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
