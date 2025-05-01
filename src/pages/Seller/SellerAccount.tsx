
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Building, Store, Truck, CreditCard, BarChart, Package } from "lucide-react";
import EditBusinessInfoForm from '@/components/seller/EditBusinessInfoForm';
import AddBusinessAddressForm from '@/components/seller/AddBusinessAddressForm';

const SellerAccount = () => {
  const { user, isLoading } = useAuth();
  const [editBusinessOpen, setEditBusinessOpen] = useState(false);
  const [addAddressOpen, setAddAddressOpen] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center min-h-[60vh]">
            <p>Loading seller account...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" />;
  }
  
  // Get business information from user metadata
  const businessName = user.user_metadata?.full_name || "Not set";
  const businessType = user.user_metadata?.business_type || "Individual Seller";
  const taxId = user.user_metadata?.tax_id || "Not set";
  const businessAddress = user.user_metadata?.business_address || null;
  
  // Handler for edit business info button
  const handleEditBusinessInfo = () => {
    setEditBusinessOpen(true);
  };
  
  // Handler for add business address button
  const handleAddBusinessAddress = () => {
    setAddAddressOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Seller Account</h1>
          
          <Tabs defaultValue="account" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="payout">Payout Settings</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Manage your seller business details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Business Details</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Business Name</p>
                          <p className="font-medium">{businessName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Business Type</p>
                          <p className="font-medium">{businessType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tax ID</p>
                          <p className="font-medium">{taxId}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4" onClick={handleEditBusinessInfo}>Edit Business Information</Button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Business Address</h3>
                      <div className="space-y-4">
                        {businessAddress ? (
                          <>
                            <p className="text-sm">{businessAddress}</p>
                            <Button variant="outline" onClick={handleAddBusinessAddress}>Update Address</Button>
                          </>
                        ) : (
                          <>
                            <p className="text-sm">No business address set</p>
                            <Button variant="outline" onClick={handleAddBusinessAddress}>Add Business Address</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Account Verification</h3>
                    <div className="space-y-2">
                      <p className="text-sm">Your account is not yet verified. Verify your account to unlock all selling features.</p>
                      <Button>Verify Account</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payout" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Payout Settings</CardTitle>
                  <CardDescription>Manage your payout methods and schedule</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                    <p className="text-sm text-muted-foreground mb-4">No payment method set. Add a bank account or payment method to receive payouts.</p>
                    <Button>Add Payment Method</Button>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Payout Schedule</h3>
                    <p className="text-sm text-muted-foreground mb-4">Set how often you want to receive your payouts</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border border-muted p-4 cursor-pointer hover:border-primary">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <h4 className="font-medium">Daily</h4>
                        <p className="text-sm text-muted-foreground">Get paid every day</p>
                      </Card>
                      
                      <Card className="border border-primary p-4 cursor-pointer">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
                          <BarChart className="h-6 w-6" />
                        </div>
                        <h4 className="font-medium">Weekly</h4>
                        <p className="text-sm text-muted-foreground">Default option</p>
                      </Card>
                      
                      <Card className="border border-muted p-4 cursor-pointer hover:border-primary">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
                          <Package className="h-6 w-6" />
                        </div>
                        <h4 className="font-medium">Monthly</h4>
                        <p className="text-sm text-muted-foreground">Get paid monthly</p>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Settings</CardTitle>
                  <CardDescription>Configure your shipping preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Shipping Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-5 border border-muted">
                          <div className="flex items-center">
                            <div className="mr-4">
                              <div className="p-2 bg-primary/10 rounded-md">
                                <Truck className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">Standard Shipping</h4>
                              <p className="text-sm text-muted-foreground">Default: 3-7 business days</p>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Enabled</span>
                            <Button variant="outline" size="sm">Configure</Button>
                          </div>
                        </Card>
                        
                        <Card className="p-5 border border-muted">
                          <div className="flex items-center">
                            <div className="mr-4">
                              <div className="p-2 bg-primary/10 rounded-md">
                                <Truck className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">Express Shipping</h4>
                              <p className="text-sm text-muted-foreground">1-2 business days</p>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Not enabled</span>
                            <Button variant="outline" size="sm">Enable</Button>
                          </div>
                        </Card>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Shipping Rules</h3>
                      <p className="text-sm text-muted-foreground mb-4">Configure shipping rates based on location and order value</p>
                      <Button>Set Up Shipping Rules</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Seller Preferences</CardTitle>
                  <CardDescription>Configure your selling preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Store Appearance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 h-32 w-full flex items-center justify-center mb-3">
                          <Store className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">Store Banner</p>
                        <Button variant="outline" size="sm" className="mt-2">Upload Banner</Button>
                      </div>
                      
                      <div>
                        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 h-32 w-full flex items-center justify-center mb-3">
                          <Building className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">Store Logo</p>
                        <Button variant="outline" size="sm" className="mt-2">Upload Logo</Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Communication Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive notifications for new orders</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Message Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive notifications for buyer messages</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Listings</CardTitle>
                  <CardDescription>Manage your active listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="/my-listings" className="text-primary hover:underline">View all listings</a>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                  <CardDescription>View your seller metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="/seller/dashboard" className="text-primary hover:underline">View dashboard</a>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Subscriptions</CardTitle>
                  <CardDescription>Manage your seller subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="/seller/subscriptions" className="text-primary hover:underline">View subscriptions</a>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
      
      {/* Edit Business Information Modal */}
      <EditBusinessInfoForm 
        open={editBusinessOpen}
        onClose={() => setEditBusinessOpen(false)}
        defaultValues={{
          business_name: user.user_metadata?.full_name,
          business_type: user.user_metadata?.business_type || 'individual',
          tax_id: user.user_metadata?.tax_id,
        }}
      />
      
      {/* Add Business Address Modal */}
      <AddBusinessAddressForm
        open={addAddressOpen}
        onClose={() => setAddAddressOpen(false)}
      />
      
    </Layout>
  );
};

export default SellerAccount;
