import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLiveAQI } from '../hooks/dashboard';
import { MapPin, Wind } from 'lucide-react';

// ─── AQI color helpers ────────────────────────────────────────────────────────
const getAqiColor = (aqi: number) => {
  if (aqi <= 50)  return { hex: '#10b981', label: 'Good',                    cls: 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30' };
  if (aqi <= 100) return { hex: '#facc15', label: 'Moderate',                cls: 'text-yellow-400  bg-yellow-400/20  border-yellow-400/30'  };
  if (aqi <= 150) return { hex: '#fb923c', label: 'Sensitive Groups',        cls: 'text-orange-400  bg-orange-400/20  border-orange-400/30'  };
  if (aqi <= 200) return { hex: '#f87171', label: 'Unhealthy',               cls: 'text-red-400     bg-red-400/20     border-red-400/30'     };
  if (aqi <= 300) return { hex: '#c084fc', label: 'Very Unhealthy',          cls: 'text-purple-400  bg-purple-400/20  border-purple-400/30'  };
  return           { hex: '#fb7185', label: 'Hazardous',                     cls: 'text-rose-400    bg-rose-400/20    border-rose-400/30'    };
};

// ─── Custom SVG pin marker ────────────────────────────────────────────────────
const createPinIcon = (color: string) =>
  L.divIcon({
    html: `
      <div style="position:relative;width:36px;height:44px">
        <svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:44px;filter:drop-shadow(0 4px 12px ${color}80)">
          <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.059 27.941 0 18 0z" fill="${color}"/>
          <circle cx="18" cy="18" r="8" fill="white" fill-opacity="0.9"/>
          <circle cx="18" cy="18" r="5" fill="${color}"/>
        </svg>
      </div>`,
    className: '',
    iconSize:   [36, 44],
    iconAnchor: [18, 44],
    popupAnchor:[0, -44],
  });

// ─── View syncer ─────────────────────────────────────────────────────────────
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom, { animate: true }); }, [center, zoom, map]);
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export const MapPreview = ({
  location,
}: {
  location?: { city: string; lat: number; lon: number };
}) => {
  const [mounted, setMounted] = useState(false);
  const hasValidLocation =
    typeof location?.lat === 'number' &&
    typeof location?.lon === 'number' &&
    (location.lat !== 0 || location.lon !== 0);

  const { data: liveData } = useLiveAQI(
    hasValidLocation ? location!.city   : undefined,
    hasValidLocation ? location!.lat    : undefined,
    hasValidLocation ? location!.lon    : undefined,
  );

  useEffect(() => { setMounted(true); }, []);

  // Resolve position
  const lat      = liveData?.station_lat || location?.lat  || 0;
  const lon      = liveData?.station_lon || location?.lon  || 0;
  const cityName = location?.city        || liveData?.city || '';
  const aqi      = liveData ? Math.round(liveData.aqi) : 0;
  const pollutants = liveData?.pollutants ?? {};

  const { hex: aqiHex, label: aqiLabel, cls: aqiCls } = getAqiColor(aqi);
  const position: [number, number] = [lat, lon];

  // ─── empty state ────────────────────────────────────────────────────────────
  if (!hasValidLocation) {
    return (
      <GlassCard className="p-0 overflow-hidden relative h-[480px] flex flex-col items-center justify-center gap-4 border-border/50">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("https://{s}.basemaps.cartocdn.com/dark_all/6/32/21.png")`,
            backgroundSize: 'cover',
          }}
        />
        <MapPin className="w-14 h-14 text-emerald-500/40" strokeWidth={1} />
        <p className="text-sm font-semibold text-muted-foreground text-center relative z-10">
          Search for a city to view<br />the live pollution map.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="relative h-[480px] rounded-2xl overflow-hidden border border-emerald-900/40 shadow-2xl shadow-black/40">

      {/* ── animated gradient border glow ── */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-[5]"
        style={{
          boxShadow: `inset 0 0 0 1.5px ${aqiHex}40, 0 0 40px ${aqiHex}20`,
          transition: 'box-shadow 1s ease',
        }}
      />

      {/* ── Top overlay card ── */}
      <div className="absolute top-4 left-4 z-[900] flex items-center gap-3 bg-background/70 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10 shadow-xl pointer-events-none">
        <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Wind className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Live Pollution Map</p>
          <p className="text-sm font-semibold text-foreground leading-none mt-0.5">{cityName || 'Nearest Station'}</p>
        </div>
      </div>

      {/* ── AQI badge (top-right) ── */}
      {aqi > 0 && (
        <div
          className={`absolute top-4 right-4 z-[900] flex flex-col items-center px-4 py-2.5 rounded-2xl border backdrop-blur-xl shadow-xl pointer-events-none ${aqiCls}`}
        >
          <span className="text-2xl font-black leading-none">{aqi}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-80">{aqiLabel}</span>
        </div>
      )}

      {/* ── Pollutant pills (bottom-left) ── */}
      {Object.keys(pollutants).length > 0 && (
        <div className="absolute bottom-4 left-4 z-[900] flex flex-wrap gap-1.5 max-w-[260px] pointer-events-none">
          {Object.entries(pollutants).slice(0, 5).map(([key, val]: [string, any]) => (
            <span
              key={key}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-background/70 backdrop-blur-md border border-white/10 text-foreground/80"
            >
              {key.toUpperCase()}: {typeof val === 'object' ? (val.v ?? '—') : val}
            </span>
          ))}
        </div>
      )}

      {/* ── The Map ── */}
      {mounted && lat !== 0 && (
        <MapContainer
          center={position}
          zoom={12}
          scrollWheelZoom={false}
          zoomControl={false}
          className="h-full w-full z-0"
          style={{ background: '#0a1628' }}
        >
          <ChangeView center={position} zoom={12} />

          {/* Premium dark green-tinted tile layer */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">Carto</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Outer glow ring */}
          <Circle
            center={position}
            radius={6000}
            pathOptions={{
              color:       aqiHex,
              fillColor:   aqiHex,
              fillOpacity: 0.04,
              weight:      1,
              dashArray:   '6 4',
            }}
          />

          {/* Mid ring */}
          <Circle
            center={position}
            radius={3500}
            pathOptions={{
              color:       aqiHex,
              fillColor:   aqiHex,
              fillOpacity: 0.08,
              weight:      1.5,
            }}
          />

          {/* Inner fill */}
          <Circle
            center={position}
            radius={1500}
            pathOptions={{
              color:       aqiHex,
              fillColor:   aqiHex,
              fillOpacity: 0.18,
              weight:      2,
            }}
          />

          {/* Custom pin marker */}
          <Marker position={position} icon={createPinIcon(aqiHex)}>
            <Popup className="leaflet-popup-green">
              <div className="text-center px-1 py-0.5">
                <p className="font-bold text-base">{cityName || 'Station'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AQI <span className="font-bold" style={{ color: aqiHex }}>{aqi}</span>
                  {' · '}{aqiLabel}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
};
