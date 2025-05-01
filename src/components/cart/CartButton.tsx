
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

interface CartButtonProps {
  variant?: "default" | "ghost" | "outline";
  showCount?: boolean;
}

const CartButton = ({ variant = "ghost", showCount = true }: CartButtonProps) => {
  const { itemCount } = useCart();
  
  return (
    <Link to="/cart">
      <Button variant={variant} size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {showCount && itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-mzad-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </Button>
    </Link>
  );
};

export default CartButton;
