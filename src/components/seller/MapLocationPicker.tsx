
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (lat: string, lng: string) => void;
  initialLocation: {
    lat: number;
    lng: number;
  };
}

const MapLocationPicker = ({ 
  isOpen, 
  onClose, 
  onLocationSelected,
  initialLocation 
}: MapLocationPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // This is a placeholder for Google Maps integration
    // In a real implementation, you would integrate Google Maps API
    // and initialize the map here
    
    console.log("Map would be initialized with:", initialLocation);
    
    // This is where you'd load the Google Maps script and initialize the map
    // For now, we'll use a placeholder implementation
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate a search delay
    setTimeout(() => {
      // This would be replaced with actual geocoding
      // For demonstration, we'll just set a random nearby location
      const newLat = currentLocation.lat + (Math.random() - 0.5) * 0.01;
      const newLng = currentLocation.lng + (Math.random() - 0.5) * 0.01;
      
      setCurrentLocation({ lat: newLat, lng: newLng });
      setIsLoading(false);
    }, 1000);
  };

  const handleUseCurrentLocation = () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting current location:", error);
          setIsLoading(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    onLocationSelected(
      currentLocation.lat.toFixed(6),
      currentLocation.lng.toFixed(6)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location"
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading} variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={handleUseCurrentLocation}
            disabled={isLoading}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Use Current Location
          </Button>
          
          <div 
            ref={mapRef}
            className="w-full h-[300px] rounded-md bg-muted/20 border relative"
          >
            {/* Placeholder for the map */}
            <div className="absolute inset-0 flex items-center justify-center flex-col text-muted-foreground">
              <MapPin className="h-8 w-8 mb-2" />
              <p>Map would appear here with Google Maps integration</p>
              <p className="text-xs mt-2">Currently showing coordinates:</p>
              <p className="font-mono text-sm">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Current coordinates:</p>
            <p className="font-mono">Latitude: {currentLocation.lat.toFixed(6)}</p>
            <p className="font-mono">Longitude: {currentLocation.lng.toFixed(6)}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm Location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MapLocationPicker;
