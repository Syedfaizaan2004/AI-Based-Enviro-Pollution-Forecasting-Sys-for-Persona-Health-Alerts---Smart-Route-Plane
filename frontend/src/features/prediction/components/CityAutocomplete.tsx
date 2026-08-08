import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';

// Simplified debounce hook since we don't have one globally easily available in this snippet context
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface LocationItem {
  formatted: string;
  city?: string;
  state?: string;
  country?: string;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
  error?: string;
}

export function CityAutocomplete({ value, onChange, error }: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync external value changes (like defaultCity)
    if (value !== query) {
        setQuery(value);
    }
  }, [value, query]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      
      // Don't search if the query perfectly matches the current value (meaning they just selected it)
      if (debouncedQuery === value) return;

      setIsLoading(true);
      try {
        const { data } = await api.post('/maps/autocomplete', { text: debouncedQuery });
        setSuggestions(data.suggestions || []);
        setIsOpen(true);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, value]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: LocationItem) => {
    const cityName = item.formatted;
    setQuery(cityName);
    setIsOpen(false);
    onChange(cityName);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    onChange('');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value !== value) {
              onChange(e.target.value); // Update parent with raw text
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="Search for a city..."
          className="h-12 pl-10 pr-10 bg-background/50 rounded-xl border-border/50 focus-visible:ring-primary focus-visible:ring-offset-0"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {isLoading && suggestions.length === 0 ? (
            <div className="p-4 flex items-center justify-center text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching...
            </div>
          ) : (
            <ul className="py-2">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(item)}
                  className="px-4 py-2 hover:bg-muted/50 cursor-pointer flex items-start gap-3 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{item.formatted}</span>
                    <span className="text-xs text-muted-foreground">{item.city} {item.state} {item.country}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
