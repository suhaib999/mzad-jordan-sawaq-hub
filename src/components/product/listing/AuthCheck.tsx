
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Session } from '@supabase/supabase-js';

interface AuthCheckProps {
  session: Session | null;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ session }) => {
  const navigate = useNavigate();

  if (!session?.user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You need to be logged in to create a listing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please log in to your account to create a listing.</p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => navigate("/auth/login")}>
              Login Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return null;
};

export default AuthCheck;
