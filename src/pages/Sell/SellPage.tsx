
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CircleDollarSign, Package, ShieldCheck } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import RequireAuth from '@/components/auth/RequireAuth';

const SellPage = () => {
  const { user } = useAuth();
  
  return (
    <Layout>
      <RequireAuth message="You need to be logged in to start selling">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Start Selling on MzadKumSooq</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of sellers and turn your items into cash. Selling on MzadKumSooq is easy, secure, and effective.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CircleDollarSign className="h-10 w-10 text-mzad-secondary mb-2" />
                  <CardTitle>Earn Money</CardTitle>
                  <CardDescription>Turn unused items into cash quickly</CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <Package className="h-10 w-10 text-mzad-secondary mb-2" />
                  <CardTitle>Easy Listings</CardTitle>
                  <CardDescription>Create listings in minutes with our simple tools</CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <ShieldCheck className="h-10 w-10 text-mzad-secondary mb-2" />
                  <CardTitle>Secure Payments</CardTitle>
                  <CardDescription>Our secure platform protects both buyers and sellers</CardDescription>
                </CardHeader>
              </Card>
            </div>
            
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>Follow these simple steps to start selling</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="bg-mzad-secondary rounded-full h-8 w-8 flex items-center justify-center text-white font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Create your listing</h3>
                      <p className="text-gray-600">Take clear photos and write a detailed description of your item.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-mzad-secondary rounded-full h-8 w-8 flex items-center justify-center text-white font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Set your price</h3>
                      <p className="text-gray-600">Choose a competitive price or enable auction mode to let buyers bid.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-mzad-secondary rounded-full h-8 w-8 flex items-center justify-center text-white font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Connect with buyers</h3>
                      <p className="text-gray-600">Respond to inquiries and arrange for delivery or pickup once sold.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-mzad-secondary rounded-full h-8 w-8 flex items-center justify-center text-white font-bold shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Get paid</h3>
                      <p className="text-gray-600">Receive payment securely through our platform or in person.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/add-product" className="w-full">
                  <Button className="w-full bg-mzad-secondary hover:bg-mzad-secondary/90">
                    Create Your First Listing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Seller Tips</CardTitle>
                <CardDescription>Stand out and sell faster with these tips</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <BadgeCheck className="h-5 w-5 text-mzad-secondary shrink-0 mt-0.5" />
                    <p><span className="font-medium">Use high-quality photos</span> - Take clear, well-lit photos from multiple angles.</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <BadgeCheck className="h-5 w-5 text-mzad-secondary shrink-0 mt-0.5" />
                    <p><span className="font-medium">Write detailed descriptions</span> - Include dimensions, condition, brand, and any defects.</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <BadgeCheck className="h-5 w-5 text-mzad-secondary shrink-0 mt-0.5" />
                    <p><span className="font-medium">Price competitively</span> - Research similar items to find the right price point.</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <BadgeCheck className="h-5 w-5 text-mzad-secondary shrink-0 mt-0.5" />
                    <p><span className="font-medium">Respond quickly</span> - Fast responses to inquiries increase your chances of selling.</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <BadgeCheck className="h-5 w-5 text-mzad-secondary shrink-0 mt-0.5" />
                    <p><span className="font-medium">Be honest</span> - Always disclose any flaws or issues with your items.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/my-listings">
                  <Button variant="outline">Manage My Listings</Button>
                </Link>
                <Link to="/add-product">
                  <Button className="bg-mzad-secondary hover:bg-mzad-secondary/90">Create New Listing</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </RequireAuth>
    </Layout>
  );
};

export default SellPage;
