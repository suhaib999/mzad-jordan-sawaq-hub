
import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationPickerButtonProps {
  latitude?: string;
  longitude?: string;
  onClick: () => void;
}

const LocationPickerButton: React.FC<LocationPickerButtonProps> = ({ 
  latitude, 
  longitude, 
  onClick 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <h3 className="text-sm font-medium">Map Location</h3>
        <p className="text-sm text-muted-foreground">
          {latitude && longitude 
            ? `Location set: ${latitude}, ${longitude}` 
            : "No location set"}
        </p>
      </div>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={onClick}
        className="flex items-center gap-1"
      >
        <MapPin className="h-4 w-4" />
        Set on Map
      </Button>
    </div>
  );
};

export default LocationPickerButton;
