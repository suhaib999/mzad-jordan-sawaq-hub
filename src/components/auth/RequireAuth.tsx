
import { ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
  message?: string;
}

const RequireAuth = ({ children, message = "You need to be logged in to view this page" }: RequireAuthProps) => {
  const { session } = useAuth();
  
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-12 w-12 text-mzad-secondary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6 text-center">
              {message}
            </p>
            <Link to="/login">
              <Button>Login to continue</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
