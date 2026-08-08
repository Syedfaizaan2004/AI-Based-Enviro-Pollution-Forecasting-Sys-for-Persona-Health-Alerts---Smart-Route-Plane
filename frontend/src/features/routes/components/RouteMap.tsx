import { useEffect, useState, Fragment } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { RecommendedRoute } from '../types/route';
import { decodePolyline } from '../utils/polyline';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RouteMapProps {
  routes: RecommendedRoute[];
  selectedRoute: RecommendedRoute | null;
  onSelectRoute: (route: RecommendedRoute) => void;
  isNavigating?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

// Helper to fit bounds when routes change or user moves
const MapBoundsFitter = ({ routes, userLocation }: { routes: RecommendedRoute[], userLocation?: { lat: number; lng: number } | null }) => {
  const map = useMap();

  useEffect(() => {
    if (routes.length === 0 && !userLocation) return;
    
    const bounds = L.latLngBounds([]);
    
    // Add routes to bounds
    routes.forEach(route => {
      route.waypoints.forEach(wp => {
        bounds.extend([wp.latitude, wp.longitude]);
      });
    });

    // Add user location to bounds
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [routes, userLocation, map]);

  return null;
};

// Helper to auto-pan when user moves (only if they are actually driving)
// For testing on laptops where the user is far from the route, forcing zoom=16 hides the route.
const MapPanner = ({ userLocation, isNavigating }: { userLocation?: { lat: number; lng: number } | null, isNavigating?: boolean }) => {
  const [hasInitialPanned, setHasInitialPanned] = useState(false);
  
  useEffect(() => {
    if (isNavigating && userLocation && !hasInitialPanned) {
      // Don't force zoom to 16, just let MapBoundsFitter handle the bounds 
      // so the user can see both their blue dot and the route if they are testing far away.
      setHasInitialPanned(true);
    }
  }, [userLocation, isNavigating, hasInitialPanned]);
  
  return null;
};

export const RouteMap = ({ routes, selectedRoute, onSelectRoute, isNavigating, userLocation }: RouteMapProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if dark mode is active to swap map tiles
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const mapStyle = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const getAQIColor = (aqi: number) => {
    if (aqi < 0) return '#94a3b8'; // slate-400 for preview
    if (aqi <= 50) return '#10b981'; // emerald-500
    if (aqi <= 100) return '#f59e0b'; // amber-500
    if (aqi <= 150) return '#f97316'; // orange-500
    return '#ef4444'; // destructive
  };

  // Decode the google encoded polyline to get the exact road curves
  const renderRouteSegments = (route: RecommendedRoute, isSelected: boolean) => {
    if (!route.polyline) return null;
    
    try {
      const decodedPath = decodePolyline(route.polyline);
      if (!decodedPath || decodedPath.length === 0) return null;
      
      const color = getAQIColor(route.scores.average_aqi || 50);
      
      return (
        <Polyline
          key={route.route_id || route.rank}
          positions={decodedPath}
          color={color}
          weight={isSelected ? 6 : 4}
          opacity={isSelected ? 1 : 0.4}
          dashArray={route.scores.average_aqi < 0 ? "5, 10" : undefined}
          eventHandlers={{
            click: () => onSelectRoute(route)
          }}
          className={isSelected && route.scores.average_aqi >= 0 ? 'animate-pulse' : ''}
        />
      );
    } catch (e) {
      console.error("Failed to decode polyline", e);
      return null;
    }
  };

  const createAQIIcon = (aqi: number) => {
    const color = getAQIColor(aqi);
    return L.divIcon({
      html: `<div style="background-color: ${color}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);">${Math.round(aqi)}</div>`,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const createHotspotIcon = (aqi: number) => {
    const color = getAQIColor(aqi);
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  const renderMarkers = () => {
    if (!selectedRoute) return null;

    if (isNavigating) {
      // Show numeric AQI marker for every waypoint
      return selectedRoute.waypoints.map((wp, idx) => (
        <Marker 
          key={`nav-${idx}`} 
          position={[wp.latitude, wp.longitude]}
          icon={createAQIIcon(wp.predicted_aqi)}
        >
          <Popup>
            <div className="text-center font-medium">
              AQI: {Math.round(wp.predicted_aqi)}<br/>
              <span className="text-xs text-muted-foreground">{wp.aqi_category}</span>
            </div>
          </Popup>
        </Marker>
      ));
    }

    // Otherwise show hotspot indicators
    const hotspots = selectedRoute.waypoints.filter((wp, i) => wp.predicted_aqi >= 0 && (i % Math.max(1, Math.floor(selectedRoute.waypoints.length / 3)) === 0));

    return hotspots.map((wp, idx) => (
      <Marker 
        key={`hotspot-${idx}`} 
        position={[wp.latitude, wp.longitude]}
        icon={createHotspotIcon(wp.predicted_aqi)}
      >
        <Popup>
          <div className="text-center font-medium">
            {wp.city_name || "Hotspot"}<br/>
            AQI: {Math.round(wp.predicted_aqi)}
          </div>
        </Popup>
      </Marker>
    ));
  };

  const createBlueDotIcon = () => {
    return L.divIcon({
      html: `
        <div class="relative flex h-6 w-6 items-center justify-center">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-md"></span>
        </div>
      `,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden border border-border/50 shadow-2xl z-0">
      <MapContainer 
        center={[28.6139, 77.2090]} // Default to New Delhi
        zoom={12} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          url={mapStyle}
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        
        <MapBoundsFitter routes={routes} userLocation={userLocation} />
        <MapPanner userLocation={userLocation} isNavigating={isNavigating} />

        {/* Unselected Routes first so they are behind */}
        {routes.filter(r => r !== selectedRoute).map((route, idx) => (
          <Fragment key={`unselected-${idx}`}>
            {renderRouteSegments(route, false)}
          </Fragment>
        ))}

        {/* Selected Route on top */}
        {selectedRoute && renderRouteSegments(selectedRoute, true)}
        
        {/* Source and Destination Markers (using first route) */}
        {routes.length > 0 && (
          <>
            <Marker position={[routes[0].waypoints[0].latitude, routes[0].waypoints[0].longitude]}>
              <Popup>Start</Popup>
            </Marker>
            <Marker position={[
              routes[0].waypoints[routes[0].waypoints.length - 1].latitude, 
              routes[0].waypoints[routes[0].waypoints.length - 1].longitude
            ]}>
              <Popup>Destination</Popup>
            </Marker>
          </>
        )}

        {/* Live GPS Blue Dot */}
        {isNavigating && userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createBlueDotIcon()} zIndexOffset={1000} />
        )}

        {/* Hotspots or Navigating Markers */}
        {renderMarkers()}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-6 right-6 z-10 bg-background/80 backdrop-blur-md p-3 rounded-2xl border border-border/50 shadow-lg text-xs font-medium space-y-1.5">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Good (0-50)</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /> Moderate (51-100)</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /> Unhealthy for Sensitive (101-150)</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive" /> Unhealthy (151+)</div>
      </div>
    </div>
  );
};
