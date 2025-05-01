
import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-9xl font-bold text-mzad-primary">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-6">Page Not Found</h2>
        <p className="text-xl text-gray-600 max-w-md mb-8">
          We couldn't find the page you're looking for. The link might be incorrect or the page may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link to="/">Return to Homepage</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/help">Contact Support</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
