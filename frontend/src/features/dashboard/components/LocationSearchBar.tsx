import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { dashboardService } from '../services/dashboard';
import type { AutocompleteSuggestion } from '../types/dashboard';

interface LocationSearchBarProps {
  onLocationSelect: (city: string, lat: number, lon: number) => void;
}

export const LocationSearchBar = ({ onLocationSelect }: LocationSearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Use browser geolocation on mount
  useEffect(() => {
    handleUseCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const res = await dashboardService.reverseGeocode(lat, lon);
            const cityName = res.address.split(',')[0];
            onLocationSelect(cityName, lat, lon);
            setQuery(cityName);
          } catch (e) {
            console.error('Failed to reverse geocode', e);
            // Don't default to a hardcoded city — let user type manually
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          // Geolocation denied or unavailable — let user search manually
          console.warn('Geolocation denied or failed', error);
          setIsLocating(false);
        }
      );
    } else {
      // Geolocation not supported — let user search manually
      setIsLocating(false);
    }
  };

  const fetchSuggestions = async (text: string) => {
    if (!text.trim() || text.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await dashboardService.autocomplete(text);
      setSuggestions(res.suggestions || []);
      setIsOpen((res.suggestions || []).length > 0);
    } catch (e) {
      console.error('Failed to fetch autocomplete', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  };

  const handleSelectSuggestion = async (suggestion: AutocompleteSuggestion) => {
    setIsOpen(false);
    setQuery(suggestion.formatted);
    setIsSearching(true);
    try {
      const res = await dashboardService.geocode(suggestion.formatted);
      const cityName = suggestion.city || res.address.split(',')[0];
      onLocationSelect(cityName, res.location.lat, res.location.lng);
    } catch (e) {
      console.error('Failed to geocode selected address', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsOpen(false);
    setIsSearching(true);
    try {
      const res = await dashboardService.geocode(query);
      const cityName = res.address.split(',')[0];
      onLocationSelect(cityName, res.location.lat, res.location.lng);
      setQuery(res.address);
    } catch (e) {
      console.error('Failed to geocode', e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0 z-50">
      <form onSubmit={handleSearchSubmit} className="flex gap-2 relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={handleInputChange}
            onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            placeholder="Search for a city..."
            className="pl-10 pr-4 bg-background/50 border-border/50 focus:bg-background/80 transition-all"
          />
        </div>
        <Button type="submit" disabled={isSearching || !query.trim()} variant="secondary">
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          title="Use current location"
        >
          {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        </Button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-60 overflow-y-auto">
          {suggestions.map((sug, idx) => (
            <div 
              key={idx}
              className="p-3 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/40 last:border-0"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input from losing focus immediately
                handleSelectSuggestion(sug);
              }}
            >
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none mb-1">{sug.city || sug.formatted.split(',')[0]}</span>
                <span className="text-xs text-muted-foreground">{sug.formatted}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
