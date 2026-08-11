import { format } from 'date-fns';
import { Trash2, ChevronLeft, ChevronRight, Activity, Map, Wind, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { useHistoryStore, type HistoryTab } from '../store/historyStore';
import { 
  usePredictionsHistory, 
  useRoutesHistory, 
  useDeletePrediction,
  useDeleteAllPredictions,
  useDeleteRoute,
  useDeleteAllRoutes
} from '../hooks/useHistory';
import { ExportToolbar } from './ExportToolbar';
import { CityName } from './CityName';
import { PredictionDetailsModal } from './PredictionDetailsModal';
import { RouteDetailsModal } from './RouteDetailsModal';
import { FeedbackDetailsModal } from './FeedbackDetailsModal';
import { useState } from 'react';
import type { PredictionHistoryResponse } from '../types/history';
import type { RouteHistoryResponse } from '@/features/routes/types/route';
import { useMyFeedback } from '@/features/feedback/hooks/useFeedback';

export function HistoryTable() {
  const { activeTab, setActiveTab, filters, setFilters } = useHistoryStore();
  
  const { data: predictionsData, isLoading: isLoadingPreds } = usePredictionsHistory(filters);
  const { data: routesData, isLoading: isLoadingRoutes } = useRoutesHistory(filters);
  
  // Feedback pagination (using the same page/size filter for simplicity)
  const skip = ((filters.page || 1) - 1) * (filters.size || 10);
  const limit = filters.size || 10;
  const { data: feedbackData, isLoading: isLoadingFeedback } = useMyFeedback(skip, limit);

  const deletePrediction = useDeletePrediction();
  const deleteAllPredictions = useDeleteAllPredictions();
  const deleteRoute = useDeleteRoute();
  const deleteAllRoutes = useDeleteAllRoutes();

  const [selectedPrediction, setSelectedPrediction] = useState<PredictionHistoryResponse | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteHistoryResponse | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);

  const tabs: { id: HistoryTab; label: string; icon: any }[] = [
    { id: 'predictions', label: 'Predictions', icon: Wind },
    { id: 'routes', label: 'Smart Routes', icon: Map },
    { id: 'health', label: 'Health Exposure', icon: Activity },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  const handleNextPage = () => setFilters({ page: filters.page + 1 });
  const handlePrevPage = () => setFilters({ page: Math.max(1, filters.page - 1) });

  const renderPredictions = () => {
    if (isLoadingPreds) return <TableSkeleton />;
    if (!predictionsData?.items.length) return <EmptyState />;

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
            <tr>
              <th className="px-6 py-4 font-medium">Date & Time</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">AQI</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">PM2.5</th>
              <th className="px-6 py-4 font-medium hidden lg:table-cell">PM10</th>
              <th className="px-6 py-4 font-medium hidden lg:table-cell">SO2</th>
              <th className="px-6 py-4 font-medium hidden xl:table-cell">Temp</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {predictionsData.items.map((item) => (
              <tr 
                key={item.id} 
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelectedPrediction(item)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4">
                  {item.city ? item.city : <CityName lat={item.latitude} lng={item.longitude} />}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{Math.round(item.aqi_value)}</span>
                    <Badge variant={
                      item.aqi_category === 'Good' ? 'default' : 
                      item.aqi_category === 'Moderate' ? 'secondary' : 'destructive'
                    } className="text-[10px] px-1.5 py-0.5">
                      {item.aqi_category}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                  {item.pm25?.toFixed(1) ?? '--'} <span className="text-[10px]">µg</span>
                </td>
                <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">
                  {item.pm10?.toFixed(1) ?? '--'} <span className="text-[10px]">µg</span>
                </td>
                <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">
                  {item.so2?.toFixed(1) ?? '--'} <span className="text-[10px]">µg</span>
                </td>
                <td className="px-6 py-4 text-muted-foreground hidden xl:table-cell">
                  {item.temperature?.toFixed(1) ?? '--'} <span className="text-[10px]">°C</span>
                </td>
                <td className="px-6 py-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePrediction.mutate(item.id);
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {renderPagination(predictionsData.current_page, predictionsData.total_count, predictionsData.page_size)}
      </div>
    );
  };

  const renderRoutes = () => {
    if (isLoadingRoutes) return <TableSkeleton />;
    if (!routesData?.items.length) return <EmptyState />;

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
            <tr>
              <th className="px-6 py-4 font-medium">Date Planned</th>
              <th className="px-6 py-4 font-medium hidden sm:table-cell">Source</th>
              <th className="px-6 py-4 font-medium hidden sm:table-cell">Destination</th>
              <th className="px-6 py-4 font-medium">Distance</th>
              <th className="px-6 py-4 font-medium">Duration</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {routesData.items.map((item) => (
              <tr 
                key={item.id} 
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelectedRoute(item)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  {item.start_address || <CityName lat={item.start_lat} lng={item.start_lng} />}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  {item.end_address || <CityName lat={item.end_lat} lng={item.end_lng} />}
                </td>
                <td className="px-6 py-4 text-foreground">
                  {item.total_distance_km.toFixed(2)} km
                </td>
                <td className="px-6 py-4 text-foreground">
                  {item.estimated_duration_min.toFixed(0)} min
                </td>
                <td className="px-6 py-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRoute.mutate(item.id);
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {renderPagination(routesData.current_page, routesData.total_count, routesData.page_size)}
      </div>
    );
  };

  const renderExposure = () => {
    if (isLoadingRoutes) return <TableSkeleton />;
    if (!routesData?.items.length) return <EmptyState />;

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Daily Avg AQI</th>
              <th className="px-6 py-4 font-medium">Peak AQI</th>
              <th className="px-6 py-4 font-medium">Cumulative PM2.5</th>
              <th className="px-6 py-4 font-medium">Time Outdoors</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {routesData.items.map((item) => {
              const score = item.scores?.[0];
              const avgPm25 = item.waypoints && item.waypoints.length > 0 
                ? item.waypoints.reduce((acc, wp) => acc + (wp.pm25 || 0), 0) / item.waypoints.length 
                : 0;
              const cumulativePm25 = avgPm25 * (item.estimated_duration_min / 60.0);
              
              return (
                <tr 
                  key={item.id} 
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedRoute(item)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {score?.average_aqi?.toFixed(1) || '--'}
                  </td>
                  <td className="px-6 py-4 text-rose-500 font-semibold">
                    {score?.maximum_aqi?.toFixed(1) || '--'}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {cumulativePm25 > 0 ? cumulativePm25.toFixed(1) : '--'} µg
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {item.estimated_duration_min.toFixed(0)} min
                  </td>
                  <td className="px-6 py-4">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRoute.mutate(item.id);
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {renderPagination(routesData.current_page, routesData.total_count, routesData.page_size)}
      </div>
    );
  };

  const renderFeedback = () => {
    if (isLoadingFeedback) return <TableSkeleton />;
    if (!feedbackData?.items.length) return <EmptyState />;

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Subject</th>
              <th className="px-6 py-4 font-medium">Rating</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {feedbackData.items.map((item) => (
              <tr 
                key={item.id} 
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelectedFeedback(item)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                  {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {item.category.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 font-medium text-foreground">
                  {item.subject}
                </td>
                <td className="px-6 py-4 text-amber-400">
                  {item.rating ? `${item.rating} / 5` : '--'}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={
                    item.status === 'resolved' ? 'default' : 
                    item.status === 'reviewed' ? 'secondary' : 'outline'
                  } className="text-[10px] uppercase">
                    {item.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {renderPagination(feedbackData.page, feedbackData.total_count, feedbackData.size)}
      </div>
    );
  };

  const renderPagination = (currentPage: number, total: number, size: number) => {
    const totalPages = Math.ceil(total / size) || 1;
    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{((currentPage - 1) * size) + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * size, total)}</span> of <span className="font-medium text-foreground">{total}</span> results
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  const currentData = activeTab === 'predictions' 
    ? predictionsData?.items 
    : activeTab === 'feedback'
      ? feedbackData?.items
      : routesData?.items;

  return (
    <div className="space-y-4">
      <ExportToolbar data={currentData || []} filename={`airsense_${activeTab}_history`} />
      
      <GlassCard className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-background shadow-sm text-primary' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          {activeTab === 'predictions' && predictionsData?.items.length ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete all prediction history? This cannot be undone.")) {
                  deleteAllPredictions.mutate();
                }
              }}
              className="text-destructive hover:bg-destructive/10 border-destructive/20 gap-2 mr-2"
              disabled={deleteAllPredictions.isPending}
            >
              <Trash2 className="h-4 w-4" />
              {deleteAllPredictions.isPending ? 'Clearing...' : 'Clear All'}
            </Button>
          ) : null}
          
          {(activeTab === 'routes' || activeTab === 'health') && routesData?.items.length ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete all route history? This cannot be undone.")) {
                  deleteAllRoutes.mutate();
                }
              }}
              className="text-destructive hover:bg-destructive/10 border-destructive/20 gap-2 mr-2"
              disabled={deleteAllRoutes.isPending}
            >
              <Trash2 className="h-4 w-4" />
              {deleteAllRoutes.isPending ? 'Clearing...' : 'Clear All'}
            </Button>
          ) : null}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'predictions' && renderPredictions()}
            {activeTab === 'routes' && renderRoutes()}
            {activeTab === 'health' && renderExposure()}
            {activeTab === 'feedback' && renderFeedback()}
          </motion.div>
        </AnimatePresence>
      </GlassCard>

      <PredictionDetailsModal 
        prediction={selectedPrediction}
        isOpen={!!selectedPrediction}
        onClose={() => setSelectedPrediction(null)}
      />

      <RouteDetailsModal
        route={selectedRoute}
        isOpen={!!selectedRoute}
        onClose={() => setSelectedRoute(null)}
      />

      <FeedbackDetailsModal
        feedback={selectedFeedback}
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
      />
    </div>
  );
}

const TableSkeleton = () => (
  <div className="w-full">
    <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-border/50">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-4 w-20" />
      ))}
    </div>
    <div className="divide-y divide-border/50">
      {[...Array(5)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-4 px-6 py-4">
          {[...Array(5)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full max-w-[120px]" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
      <Activity className="h-8 w-8 text-muted-foreground/50" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">No history found</h3>
    <p className="text-muted-foreground max-w-sm">
      Looks like there's no data recorded for this section yet. Make some predictions or plan routes to see them here.
    </p>
  </div>
);
