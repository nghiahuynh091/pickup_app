import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationCoords {
  lat: number;
  lng: number;
}

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private locationCallback: ((location: LocationCoords) => void) | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location permission to show your position on the map and share it with friends during hangouts.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Request background location permission for better tracking
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission not granted');
      }

      return true;
    } catch (error) {
      console.error('Failed to request location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationCoords | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }

  async startLocationTracking(
    callback: (location: LocationCoords) => void,
    options?: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    }
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      // Stop existing tracking
      this.stopLocationTracking();

      this.locationCallback = callback;

      const defaultOptions = {
        accuracy: Location.Accuracy.Balanced, // Changed from High to Balanced for better battery life
        timeInterval: 5000, // Update every 5 seconds (was 3 seconds)
        distanceInterval: 10, // Update every 10 meters (was 5 meters)
        ...options,
      };

      this.watchId = await Location.watchPositionAsync(
        defaultOptions,
        (location) => {
          const coords = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
          
          console.log('📍 Location updated:', coords);
          callback(coords);
        }
      );

      console.log('✅ Location tracking started');
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      Alert.alert(
        'Location Error',
        'Failed to start location tracking. Please check your location settings.'
      );
      return false;
    }
  }

  stopLocationTracking(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
      this.locationCallback = null;
      console.log('📍 Location tracking stopped');
    }
  }

  isTracking(): boolean {
    return this.watchId !== null;
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(loc1: LocationCoords, loc2: LocationCoords): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Check if user is near destination (within specified radius in meters)
  isNearDestination(
    currentLocation: LocationCoords, 
    destination: LocationCoords, 
    radiusInMeters: number = 100
  ): boolean {
    const distanceInKm = this.calculateDistance(currentLocation, destination);
    const distanceInMeters = distanceInKm * 1000;
    return distanceInMeters <= radiusInMeters;
  }

  // Get formatted address from coordinates (reverse geocoding)
  async getAddressFromCoords(coords: LocationCoords): Promise<string | null> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: coords.lat,
        longitude: coords.lng,
      });

      if (results.length > 0) {
        const result = results[0];
        const address = [
          result.streetNumber,
          result.street,
          result.city,
          result.region,
        ].filter(Boolean).join(', ');
        
        return address || 'Unknown location';
      }

      return null;
    } catch (error) {
      console.error('Failed to get address from coordinates:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();