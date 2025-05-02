
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
