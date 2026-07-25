class RouteScoreService:
    @staticmethod
    def calculate_smart_route_score(
        pollution_score: float, 
        exposure_score: float, 
        travel_time_score: float, 
        health_score: float
    ) -> float:
        w_pollution = 0.40
        w_exposure = 0.30
        w_time = 0.20
        w_health = 0.10
        
        composite = (
            (pollution_score * w_pollution) +
            (exposure_score * w_exposure) +
            (travel_time_score * w_time) +
            (health_score * w_health)
        )
        return round(composite, 2)
