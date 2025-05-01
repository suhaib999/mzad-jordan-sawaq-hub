
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the map when the component mounts and token is available
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || !mapboxToken) return;

    // Set Mapbox access token
    mapboxgl.accessToken = mapboxToken;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add the marker at the initial location
    marker.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .addTo(map.current);

    // Update coordinates when marker is dragged
    marker.current.on('dragend', () => {
      if (marker.current) {
        const lngLat = marker.current.getLngLat();
        setCurrentLocation({
          lat: lngLat.lat,
          lng: lngLat.lng
        });
      }
    });

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (marker.current) {
        marker.current = null;
      }
    };
  }, [isOpen, mapboxToken, currentLocation.lat, currentLocation.lng]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapboxToken || !map.current) return;

    setIsLoading(true);
    try {
      // Geocode the search query using Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        // Update the map center
        map.current.flyTo({ center: [lng, lat], zoom: 14 });
        
        // Update the marker position
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        }
        
        // Update state with new coordinates
        setCurrentLocation({ lat, lng });
      }
    } catch (error) {
      console.error("Error searching for location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Update the map center
          if (map.current) {
            map.current.flyTo({ 
              center: [longitude, latitude], 
              zoom: 14 
            });
          }
          
          // Update the marker position
          if (marker.current) {
            marker.current.setLngLat([longitude, latitude]);
          }
          
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
          {!mapboxToken && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              <h3 className="font-medium mb-2">Mapbox Token Required</h3>
              <p className="text-sm mb-2">You need a Mapbox access token to use the map feature.</p>
              <ol className="text-sm list-decimal ml-4 mb-3">
                <li>Sign up or log in at <a href="https://www.mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">mapbox.com</a></li>
                <li>Go to your account dashboard</li>
                <li>Copy your default public token</li>
              </ol>
              <Input
                type="text"
                placeholder="Enter your Mapbox public token"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="w-full"
              />
            </div>
          )}
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location"
              className="flex-1"
              disabled={!mapboxToken}
            />
            <Button type="submit" disabled={isLoading || !mapboxToken} variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={handleUseCurrentLocation}
            disabled={isLoading || !mapboxToken}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Use Current Location
          </Button>
          
          <div 
            ref={mapContainerRef}
            className="w-full h-[300px] rounded-md border"
            style={{ display: mapboxToken ? 'block' : 'none' }}
          />
          
          {!mapboxToken && (
            <div className="w-full h-[300px] rounded-md bg-muted/20 border relative">
              <div className="absolute inset-0 flex items-center justify-center flex-col text-muted-foreground">
                <MapPin className="h-8 w-8 mb-2" />
                <p>Enter your Mapbox token to view the map</p>
              </div>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>Current coordinates:</p>
            <p className="font-mono">Latitude: {currentLocation.lat.toFixed(6)}</p>
            <p className="font-mono">Longitude: {currentLocation.lng.toFixed(6)}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!mapboxToken}>Confirm Location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MapLocationPicker;
