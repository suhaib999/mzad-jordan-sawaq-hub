
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const { session } = useAuth();
  
  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Link to="/browse">
              <Button>
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Your Shopping Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Cart Items ({items.length})</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear Cart
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {items.map((item) => (
                      <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-full sm:w-24 h-24 shrink-0">
                          <img 
                            src={item.product.main_image_url || ''} 
                            alt={item.product.title} 
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-grow">
                          <Link to={`/product/${item.id}`} className="hover:underline">
                            <h3 className="font-medium text-lg">{item.product.title}</h3>
                          </Link>
                          <p className="text-sm text-gray-500 mb-2">Condition: {item.product.condition}</p>
                          <p className="font-semibold mb-2">
                            {item.product.currency} {Number(item.product.price).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="mx-2 w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>JOD {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>To be calculated</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>JOD {subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={session ? "/checkout" : "/auth/login"} className="w-full">
                    <Button className="w-full bg-mzad-secondary hover:bg-mzad-secondary/90">
                      {session ? "Proceed to Checkout" : "Login to Checkout"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
