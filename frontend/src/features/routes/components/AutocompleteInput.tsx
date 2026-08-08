import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/input';
import { api } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';

interface AutocompleteSuggestion {
  formatted: string;
  city?: string;
  state?: string;
  country?: string;
}

interface AutocompleteInputProps extends Omit<InputProps, 'onChange' | 'onSelect'> {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: AutocompleteSuggestion) => void;
  error?: string;
}

export function AutocompleteInput({ value, onChange, onSuggestionSelect, error, className, ...props }: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearchTerm = useDebounce(value, 400);

  const { data: suggestions, isFetching } = useQuery({
    queryKey: ['autocomplete', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];
      const res = await api.post('/maps/autocomplete', { text: debouncedSearchTerm });
      return res.data.suggestions as AutocompleteSuggestion[];
    },
    enabled: !!(debouncedSearchTerm && debouncedSearchTerm.length >= 2),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <Input
        {...props}
        value={value || ''}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className={className}
        autoComplete="off"
      />
      {error && <p className="text-[10px] text-destructive px-1 mt-1">{error}</p>}
      
      {isOpen && debouncedSearchTerm && debouncedSearchTerm.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl overflow-hidden">
          {isFetching ? (
            <div className="p-4 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <ul className="max-h-60 overflow-auto py-1">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-muted cursor-pointer text-sm transition-colors"
                  onClick={() => {
                    onChange(item.formatted);
                    setIsOpen(false);
                    if (onSuggestionSelect) onSuggestionSelect(item);
                  }}
                >
                  <p className="font-medium text-foreground truncate">{item.formatted}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
