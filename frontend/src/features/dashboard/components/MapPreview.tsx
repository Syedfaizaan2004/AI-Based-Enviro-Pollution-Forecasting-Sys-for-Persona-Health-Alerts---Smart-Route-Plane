import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useLiveAQI, useDashboardSummary } from '../hooks/dashboard';

// Fix for default marker icon in react-leaflet
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return '#34d399';    // Good - emerald
  if (aqi <= 100) return '#facc15';   // Moderate - yellow
  if (aqi <= 150) return '#fb923c';   // Unhealthy for sensitive - orange
  if (aqi <= 200) return '#f87171';   // Unhealthy - red
  if (aqi <= 300) return '#c084fc';   // Very Unhealthy - purple
  return '#9f1239';                   // Hazardous - rose
};

// Component to dynamically update map center when location changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export const MapPreview = ({ location }: { location?: { city: string, lat: number, lon: number } }) => {
  const [mounted, setMounted] = useState(false);
  const { data: summary } = useDashboardSummary();
  const { data: liveData } = useLiveAQI(location?.city);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine center position
  let lat = 37.7749;
  let lon = -122.4194;
  let cityName = 'San Francisco';
  let aqi = 0;
  let category = 'Unknown';

  if (location?.lat && location?.lon) {
    lat = location.lat;
    lon = location.lon;
    cityName = location.city;
  }
  
  if (liveData) {
    aqi = Math.round(liveData.aqi);
    category = liveData.category;
    // Pinpoint exact station if available from backend
    if (liveData.station_lat && liveData.station_lon) {
      lat = liveData.station_lat;
      lon = liveData.station_lon;
    }
  } else if (summary?.cards) {
    aqi = Math.round(summary.cards.current_aqi);
    category = summary.cards.latest_aqi_category;
  }

  const position: [number, number] = [lat, lon];
  const color = getAqiColor(aqi) || 'gray';

  return (
    <GlassCard className="p-0 overflow-hidden border-border/50 relative h-[400px]">
      <div className="absolute top-4 left-4 z-[1000] bg-background/80 backdrop-blur-md px-4 py-2 rounded-xl border border-border/50 shadow-sm pointer-events-none">
        <h3 className="font-semibold text-sm">Live Pollution Map</h3>
        <p className="text-xs text-muted-foreground">Nearest AQI station data</p>
      </div>
      
      {mounted && (
        <MapContainer center={position} zoom={11} scrollWheelZoom={false} className="h-full w-full z-0">
          <ChangeView center={position} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <Circle center={position} radius={3000} pathOptions={{ color: color, fillColor: color, fillOpacity: 0.2 }} />
          <Marker position={position} icon={customIcon}>
            <Popup>
              <strong>{cityName || 'Selected Location'}</strong><br/>
              AQI: {aqi} ({category})
            </Popup>
          </Marker>
        </MapContainer>
      )}
    </GlassCard>
  );
};
