def calculate_smart_route_score(
    pollution_score: float, 
    exposure_score: float, 
    travel_time_score: float, 
    health_score: float
) -> float:
    """
    Calculates the Smart Route Score using a weighted formula.
    Lower score = Better route.
    Weights derived from Phase 0 Approved Formula approximations.
    """
    # E.g. 40% Pollution, 30% Exposure, 20% Time, 10% Health
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
