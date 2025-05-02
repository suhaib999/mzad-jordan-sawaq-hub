
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
import { MapPin } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileWithAvatar | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        setIsLoading(true);
        const data = await fetchProfile(user.id);
        if (data) {
          setProfileData(data);
        } else {
          toast({
            title: 'Error',
            description: 'Unable to load profile data',
            variant: 'destructive',
          });
        }
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleProfileUpdate = async () => {
    if (user?.id) {
      const updatedProfile = await fetchProfile(user.id);
      if (updatedProfile) {
        setProfileData(updatedProfile);
      }
    }
  };

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <Layout>
      <div className="container max-w-5xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account details and preferences</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="h-7 w-48 bg-gray-200 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <Tabs defaultValue="account">
              <div className="mb-6">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>
                      Update your profile picture to personalize your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AvatarUpload 
                      userId={user.id} 
                      currentAvatarUrl={profileData?.avatar_url || null} 
                      onSuccess={handleProfileUpdate}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>
                      Update your account information and contact details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profileData && (
                      <ProfileForm 
                        userId={user.id}
                        initialValues={{
                          username: profileData.username || '',
                          full_name: profileData.full_name || '',
                          phone_number: profileData.phone_number || '',
                          address: profileData.address || '',
                          location: profileData.location || '',
                        }}
                        onSuccess={handleProfileUpdate}
                      />
                    )}
                  </CardContent>
                </Card>

                {profileData?.location && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Location</CardTitle>
                      <CardDescription>Your current location</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-5 w-5" />
                        <span>{profileData.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PasswordForm userId={user.id} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
