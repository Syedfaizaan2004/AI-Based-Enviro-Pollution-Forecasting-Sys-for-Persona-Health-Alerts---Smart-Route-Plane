import { useEffect, useState, Fragment } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { RecommendedRoute } from '../types/route';
import { decodePolyline } from '../utils/polyline';

// Leaflet icon path fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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
    if (aqi < 0) return '#16a34a'; // green-600 for preview
    if (aqi <= 50) return '#10b981'; // emerald-500
    if (aqi <= 100) return '#f59e0b'; // amber-500
    if (aqi <= 150) return '#f97316'; // orange-500
    return '#ef4444'; // destructive
  };

  const renderRouteSegments = (route: RecommendedRoute, isSelected: boolean) => {
    if (!route.polyline) return null;
    try {
      const decodedPath = decodePolyline(route.polyline);
      if (!decodedPath || decodedPath.length === 0) return null;
      const color = getAQIColor(route.scores.average_aqi || 50);
      return (
        <Fragment key={route.route_id || route.rank}>
          {/* Glow layer behind selected route */}
          {isSelected && (
            <Polyline
              positions={decodedPath}
              color={color}
              weight={14}
              opacity={0.15}
              dashArray={undefined}
            />
          )}
          <Polyline
            positions={decodedPath}
            color={color}
            weight={isSelected ? 5 : 3}
            opacity={isSelected ? 0.95 : 0.35}
            dashArray={route.scores.average_aqi < 0 ? '8 10' : undefined}
            eventHandlers={{ click: () => onSelectRoute(route) }}
          />
        </Fragment>
      );
    } catch (e) {
      console.error('Failed to decode polyline', e);
      return null;
    }
  };

  const createAQIIcon = (aqi: number) => {
    const color = getAQIColor(aqi);
    return L.divIcon({
      html: `<div style="
        background:${color};
        color:white;
        width:32px;height:32px;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-weight:800;font-size:9px;
        border:2.5px solid white;
        box-shadow:0 0 12px ${color}80,0 2px 6px rgba(0,0,0,0.4);
      ">${Math.round(aqi)}</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const createHotspotIcon = (aqi: number) => {
    const color = getAQIColor(aqi);
    return L.divIcon({
      html: `<div style="
        background:${color};
        width:14px;height:14px;
        border-radius:50%;
        border:2.5px solid white;
        box-shadow:0 0 8px ${color}80;
      "></div>`,
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  };

  // SVG start/end pin markers
  const createStartIcon = () =>
    L.divIcon({
      html: `<div style="position:relative;width:36px;height:44px">
        <svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:44px;filter:drop-shadow(0 4px 12px #10b98180)">
          <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.059 27.941 0 18 0z" fill="#10b981"/>
          <circle cx="18" cy="18" r="9" fill="white" fill-opacity="0.95"/>
          <text x="18" y="22" text-anchor="middle" font-size="11" font-weight="900" fill="#10b981">S</text>
        </svg>
      </div>`,
      className: '',
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
    });

  const createEndIcon = () =>
    L.divIcon({
      html: `<div style="position:relative;width:36px;height:44px">
        <svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:44px;filter:drop-shadow(0 4px 12px #f8717180)">
          <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.059 27.941 0 18 0z" fill="#f87171"/>
          <circle cx="18" cy="18" r="9" fill="white" fill-opacity="0.95"/>
          <text x="18" y="22" text-anchor="middle" font-size="11" font-weight="900" fill="#ef4444">D</text>
        </svg>
      </div>`,
      className: '',
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
    });

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

  const createBlueDotIcon = () =>
    L.divIcon({
      html: `
        <div style="position:relative;display:flex;width:28px;height:28px;align-items:center;justify-content:center">
          <span style="position:absolute;width:28px;height:28px;border-radius:50%;background:#10b981;opacity:0.35;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></span>
          <span style="position:relative;width:16px;height:16px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 0 14px #10b98180"></span>
        </div>
      `,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

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
        
        {/* Source and Destination Markers */}
        {routes.length > 0 && (
          <>
            <Marker
              position={[routes[0].waypoints[0].latitude, routes[0].waypoints[0].longitude]}
              icon={createStartIcon()}
            >
              <Popup><div className="font-bold text-emerald-500">🟢 Start</div></Popup>
            </Marker>
            <Marker
              position={[
                routes[0].waypoints[routes[0].waypoints.length - 1].latitude,
                routes[0].waypoints[routes[0].waypoints.length - 1].longitude,
              ]}
              icon={createEndIcon()}
            >
              <Popup><div className="font-bold text-red-500">🔴 Destination</div></Popup>
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
      
      {/* Legend — glassmorphism style */}
      <div className="absolute bottom-5 right-5 z-10 bg-background/75 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl text-xs font-semibold space-y-2.5">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Air Quality Index</p>
        {[
          { color: 'bg-emerald-500', label: 'Good',              range: '0–50'   },
          { color: 'bg-yellow-400',  label: 'Moderate',          range: '51–100' },
          { color: 'bg-orange-500',  label: 'Sensitive Groups',  range: '101–150'},
          { color: 'bg-red-500',     label: 'Unhealthy',         range: '151+'   },
        ].map(({ color, label, range }) => (
          <div key={label} className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${color}`} />
            <span className="text-foreground/80">{label}</span>
            <span className="ml-auto text-muted-foreground font-normal">{range}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
