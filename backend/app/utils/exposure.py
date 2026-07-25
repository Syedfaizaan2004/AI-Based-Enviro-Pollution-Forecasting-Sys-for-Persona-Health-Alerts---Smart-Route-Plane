from app.models.enums import HealthCondition

def calculate_exposure_score(
    predicted_aqi: float, 
    travel_duration_min: float, 
    health_condition: HealthCondition = None
) -> float:
    """
    Calculates the normalized Exposure Score.
    Higher score = Worse exposure.
    Formula integrates AQI severity, time exposed, and personal health risks.
    """
    # Normalize duration (e.g., 60 mins = 1.0 multiplier, capped at 3 hours for logic)
    duration_multiplier = min(travel_duration_min / 60.0, 3.0)
    
    # Severity multiplier based on AQI brackets
    if predicted_aqi <= 50:
        severity = 0.5
    elif predicted_aqi <= 100:
        severity = 1.0
    elif predicted_aqi <= 200:
        severity = 2.0
    elif predicted_aqi <= 300:
        severity = 3.5
    else:
        severity = 5.0
        
    # Health Profile Multiplier
    health_multiplier = 1.0
    if health_condition and health_condition != HealthCondition.NONE:
        # Sensitive groups suffer higher effective exposure
        health_multiplier = 1.5
        if health_condition in [HealthCondition.ASTHMA, HealthCondition.HEART_DISEASE]:
            health_multiplier = 2.0

    raw_score = (predicted_aqi * severity * duration_multiplier * health_multiplier) / 100.0
    
    # Normalize to 0-100 scale
    normalized = max(0.0, min(100.0, raw_score * 10))
    return round(normalized, 2)
