import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, Edit2, Trash2, Plus } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useLiveAQI } from '../hooks/dashboard';

const getAqiStyles = (aqi: number) => {
  if (aqi <= 50) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  if (aqi <= 100) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
  if (aqi <= 150) return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
  if (aqi <= 200) return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  if (aqi <= 300) return { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
  return { color: 'text-rose-700', bg: 'bg-rose-700/10', border: 'border-rose-700/20' };
};

interface LocationItem {
  id: number;
  name: string;
  queryCity: string;
  lat?: number;
  lon?: number;
}

const SavedLocationCard = ({ loc, onEdit, onDelete }: { loc: LocationItem, onEdit?: () => void, onDelete?: () => void }) => {
  const { data, isLoading, isError } = useLiveAQI(loc.queryCity, loc.lat, loc.lon);

  if (isLoading) {
    return (
      <GlassCard className="flex-shrink-0 flex items-center justify-center p-3 min-w-[200px] h-[72px]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </GlassCard>
    );
  }

  if (isError || !data) {
    return (
      <GlassCard className="flex-shrink-0 flex items-center justify-between p-3 min-w-[200px] h-[72px] border-destructive/20 group relative overflow-hidden">
        <span className="text-xs font-medium text-destructive/80">Failed to load {loc.name}</span>
        {(onEdit || onDelete) && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-md">
            {onEdit && <button onClick={onEdit} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>}
            {onDelete && <button onClick={onDelete} className="p-1.5 hover:bg-destructive/10 rounded text-destructive hover:text-destructive/80 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>}
          </div>
        )}
      </GlassCard>
    );
  }

  const aqiRaw = Number(data.aqi);
  const aqi = isNaN(aqiRaw) ? 'N/A' : Math.round(aqiRaw);
  const styles = isNaN(aqiRaw) ? getAqiStyles(0) : getAqiStyles(aqiRaw);

  return (
    <GlassCard 
      className="flex-shrink-0 flex items-center justify-between gap-4 p-3 min-w-[200px] hover:bg-card/80 transition-colors group relative overflow-hidden"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg border ${styles.border} ${styles.bg} ${styles.color}`}>
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-foreground truncate max-w-[90px]">{loc.name}</p>
          <p className="text-[10px] uppercase text-muted-foreground truncate max-w-[90px]">{data.category || 'Unknown'}</p>
        </div>
      </div>
      
      <div className={`text-xl font-black ${styles.color} ${(onEdit || onDelete) ? 'group-hover:opacity-0' : ''} transition-opacity`}>
        {aqi}
      </div>

      {(onEdit || onDelete) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm py-1 pl-2 rounded-md">
          {onEdit && <button onClick={onEdit} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>}
          {onDelete && <button onClick={onDelete} className="p-1.5 hover:bg-destructive/10 rounded text-destructive hover:text-destructive/80 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>}
        </div>
      )}
    </GlassCard>
  );
};

// Initial simulated user locations
const INITIAL_LOCATIONS: LocationItem[] = [
  { id: 1, name: 'Home', queryCity: 'New York' },
  { id: 2, name: 'Work', queryCity: 'San Francisco' },
  { id: 3, name: 'Gym', queryCity: 'London' },
];

export const SavedLocations = ({ location }: { location?: { city: string, lat?: number, lon?: number } }) => {
  const [locations, setLocations] = useState<LocationItem[]>(INITIAL_LOCATIONS);
  
  // Sync the mock locations (Home, Work, Gym) to be in the current searched city
  useEffect(() => {
    if (location?.city) {
      setLocations(prev => prev.map(loc => 
        ['Home', 'Work', 'Gym'].includes(loc.name) 
          ? { ...loc, queryCity: location.city, lat: location.lat, lon: location.lon } 
          : loc
      ));
    }
  }, [location?.city, location?.lat, location?.lon]);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<LocationItem | null>(null);
  const [formData, setFormData] = useState({ name: '', queryCity: '' });

  const openAddDialog = () => {
    setEditingLoc(null);
    setFormData({ name: '', queryCity: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (loc: LocationItem) => {
    setEditingLoc(loc);
    setFormData({ name: loc.name, queryCity: loc.queryCity });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.queryCity.trim()) return;

    if (editingLoc) {
      setLocations(locations.map(loc => 
        loc.id === editingLoc.id ? { ...loc, name: formData.name, queryCity: formData.queryCity } : loc
      ));
    } else {
      setLocations([...locations, { 
        id: Date.now(), 
        name: formData.name, 
        queryCity: formData.queryCity 
      }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 overflow-x-auto pb-2 scrollbar-hide w-full">
        {locations.map((loc) => (
          <SavedLocationCard 
            key={loc.id} 
            loc={loc} 
            onEdit={() => openEditDialog(loc)}
            onDelete={() => handleDelete(loc.id)}
          />
        ))}
        
        <GlassCard 
          onClick={openAddDialog}
          className="flex-shrink-0 flex items-center justify-center p-3 min-w-[120px] cursor-pointer hover:bg-card/80 transition-colors border-dashed border-border/50 text-muted-foreground hover:text-foreground group"
        >
          <div className="flex items-center gap-2 group-hover:scale-105 transition-transform">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Add New</span>
          </div>
        </GlassCard>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingLoc ? 'Edit Location' : 'Add New Location'}</DialogTitle>
            <DialogDescription>
              Enter a display name and the real-world city to fetch AQI for.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Label
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Home, School"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="city" className="text-right text-sm font-medium">
                City Name
              </label>
              <Input
                id="city"
                value={formData.queryCity}
                onChange={(e) => setFormData({ ...formData, queryCity: e.target.value })}
                placeholder="e.g. Los Angeles"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingLoc ? 'Save Changes' : 'Add Location'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
