import { create } from 'zustand';
import type { RecommendedRoute } from '../types/route';

type TravelMode = 'Walking' | 'Cycling' | 'Driving';
type Priority = 'Fastest' | 'Cleanest' | 'Balanced';

interface RouteState {
  selectedRoute: RecommendedRoute | null;
  travelMode: TravelMode;
  priority: Priority;
  avoidHighAQI: boolean;
  avoidTraffic: boolean;
  avoidConstruction: boolean;

  setSelectedRoute: (route: RecommendedRoute | null) => void;
  setTravelMode: (mode: TravelMode) => void;
  setPriority: (priority: Priority) => void;
  toggleAvoidHighAQI: () => void;
  toggleAvoidTraffic: () => void;
  toggleAvoidConstruction: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  selectedRoute: null,
  travelMode: 'Driving',
  priority: 'Balanced',
  avoidHighAQI: true,
  avoidTraffic: true,
  avoidConstruction: false,

  setSelectedRoute: (route) => set({ selectedRoute: route }),
  setTravelMode: (mode) => set({ travelMode: mode }),
  setPriority: (priority) => set({ priority: priority }),
  toggleAvoidHighAQI: () => set((state) => ({ avoidHighAQI: !state.avoidHighAQI })),
  toggleAvoidTraffic: () => set((state) => ({ avoidTraffic: !state.avoidTraffic })),
  toggleAvoidConstruction: () => set((state) => ({ avoidConstruction: !state.avoidConstruction })),
}));
