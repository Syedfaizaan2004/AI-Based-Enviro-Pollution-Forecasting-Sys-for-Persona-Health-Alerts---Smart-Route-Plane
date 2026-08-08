import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { PredictionForm } from '@/features/prediction/components/PredictionForm';
import { PredictionResult } from '@/features/prediction/components/PredictionResult';
import { usePredictAQI } from '@/features/prediction/hooks/usePrediction';
import type { PredictionFormValues } from '@/features/prediction/validation/prediction';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api';
import { getApiErrorMessage } from '@/utils/apiError';

const DEFAULT_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "New Delhi": { lat: 28.6139, lng: 77.2090 },
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Bengaluru": { lat: 12.9716, lng: 77.5946 },
  "Chennai": { lat: 13.0827, lng: 80.2707 },
};

export const Prediction = () => {
  const [searchParams] = useSearchParams();
  const searchCity = searchParams.get('city') || undefined;
  const { mutateAsync: predictAQI, isPending } = usePredictAQI();
  const [predictionData, setPredictionData] = useState<any[] | null>(null);

  const onSubmit = async (values: PredictionFormValues) => {
    try {
      // Combine date and time into local date-time string
      const dateTimeStr = `${values.predictionDate}T${values.predictionTime}:00`;
      let latitude = values.latitude;
      let longitude = values.longitude;

      if (values.city && !DEFAULT_CITY_COORDS[values.city]) {
        const { data } = await api.post('/maps/geocode', { address: values.city });
        latitude = data.location.lat;
        longitude = data.location.lng;
      }
      
      const baseTime = new Date(dateTimeStr);
      const promises = [];
      
      for (let i = 0; i <= 6; i++) {
        const targetTime = new Date(baseTime);
        targetTime.setHours(targetTime.getHours() + i);
        
        const payload = {
          latitude,
          longitude,
          prediction_time: targetTime.toISOString(),
          city: values.city,
          health_condition: values.healthCondition === 'none' ? undefined : values.healthCondition,
          skip_history: i > 0, // only save the first (current) prediction to history
        };
        promises.push(predictAQI(payload));
      }

      const results = await Promise.all(promises);
      setPredictionData(results);
      toast.success("6-hour forecast generated successfully!");
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to generate prediction"));
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1920px] mx-auto w-full min-h-[calc(100vh-4rem)]">
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Prediction Studio</h1>
        <p className="text-muted-foreground mt-1">
          Harness our advanced ensemble ML models to forecast air quality.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-full">
        
        {/* Left Column - Form */}
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <PredictionForm onSubmit={onSubmit} isLoading={isPending} defaultCity={searchCity} />
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-7 xl:col-span-8 h-full min-h-[600px]">
          <PredictionResult data={predictionData} />
        </div>
        
      </div>
      
    </div>
  );
};
