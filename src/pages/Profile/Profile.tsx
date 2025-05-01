
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from '@/hooks/use-toast';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { PasswordForm } from '@/components/profile/PasswordForm';
import { fetchProfile, ProfileWithAvatar } from '@/services/profileService';

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileWithAvatar | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const profileData = await fetchProfile(user.id);
        if (profileData) {
          setProfile(profileData);
        } else {
          toast({
            title: 'Error loading profile',
            description: 'Could not load your profile data. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error loading profile',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadProfile();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const handleAvatarChange = (url: string) => {
    if (profile) {
      setProfile({
        ...profile,
        avatar_url: url,
      });
    }
  };

  const handleProfileUpdate = () => {
    // Refresh profile data
    if (user) {
      fetchProfile(user.id).then(profileData => {
        if (profileData) {
          setProfile(profileData);
        }
      });
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

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center min-h-[60vh]">
            <p>No profile data found. Please try again.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Account</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your personal details</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <AvatarUpload 
                  userId={user!.id} 
                  currentAvatarUrl={profile.avatar_url}
                  onAvatarChange={handleAvatarChange}
                  size="lg"
                />
                <div className="mt-4 text-center">
                  <h3 className="font-medium text-lg">{profile.full_name || profile.username}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="md:col-span-2">
              <Tabs defaultValue="details">
                <TabsList className="mb-6">
                  <TabsTrigger value="details">Profile Details</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProfileForm 
                        userId={user!.id}
                        initialValues={{
                          username: profile.username || '',
                          full_name: profile.full_name || '',
                          phone_number: profile.phone_number || '',
                          address: profile.address || '',
                        }}
                        onSuccess={handleProfileUpdate}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="password">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>Update your account password</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PasswordForm />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Your Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Listings</CardTitle>
                  <CardDescription>Products you're selling</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="/my-listings" className="text-primary hover:underline">View all listings</a>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Purchase History</CardTitle>
                  <CardDescription>Products you've bought</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="/purchases" className="text-primary hover:underline">View purchase history</a>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Saved Items</CardTitle>
                  <CardDescription>Products you've saved</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="/saved" className="text-primary hover:underline">View saved items</a>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
