
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, Package, Settings, ShieldCheck, ArrowRight, Layers, Plus } from 'lucide-react';

const SellPage = () => {
  const { session } = useAuth();
  const isLoggedIn = !!session?.user;

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Start Selling</h1>
          <p className="text-gray-600 mb-8">
            Create a listing and reach thousands of potential buyers today.
          </p>

          {!isLoggedIn ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-xl text-blue-800 mb-2">
                Please sign in to sell
              </h2>
              <p className="text-blue-600 mb-4">
                You need to be signed in to create listings and sell items.
              </p>
              <div className="flex space-x-4">
                <Button asChild>
                  <Link to="/auth/login">Sign In</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/auth/register">Create Account</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <Card className="border-2 border-mzad-primary overflow-hidden shadow hover:shadow-md transition-shadow">
                  <CardHeader className="bg-mzad-primary/5">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">New Listing</CardTitle>
                        <CardDescription>Create a listing from scratch</CardDescription>
                      </div>
                      <Plus size={24} className="text-mzad-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Tag size={18} className="text-mzad-primary" />
                        <span>Fixed price or auction options</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Layers size={18} className="text-mzad-primary" />
                        <span>Bulk selling with inventory tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-mzad-primary" />
                        <span>Category-specific attributes</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button className="w-full" asChild>
                      <Link to="/sell/create">
                        Start Creating <ArrowRight size={16} className="ml-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="overflow-hidden shadow hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">Legacy Form</CardTitle>
                        <CardDescription>Use the previous listing form</CardDescription>
                      </div>
                      <Settings size={24} className="text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Package size={18} className="text-gray-500" />
                        <span>Basic listing features</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Tag size={18} className="text-gray-500" />
                        <span>Fixed price and auction options</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/sell/add-product">
                        Use Legacy Form
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="font-semibold text-xl mb-4">Selling Tips</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Great Photos</h3>
                    <p className="text-sm text-gray-600">
                      Take clear, well-lit photos from multiple angles to show your item's condition.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Accurate Description</h3>
                    <p className="text-sm text-gray-600">
                      Be honest about the condition and include all relevant details about your item.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Fair Pricing</h3>
                    <p className="text-sm text-gray-600">
                      Research similar items to set a competitive price that will attract buyers.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SellPage;
