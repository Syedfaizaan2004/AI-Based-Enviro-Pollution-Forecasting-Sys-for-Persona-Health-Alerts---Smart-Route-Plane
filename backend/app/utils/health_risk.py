from app.models.enums import AQICategory, HealthCondition

def get_aqi_category(aqi_value: float) -> AQICategory:
    if aqi_value <= 50:
        return AQICategory.GOOD
    elif aqi_value <= 100:
        return AQICategory.FAIR
    elif aqi_value <= 200:
        return AQICategory.MODERATE
    elif aqi_value <= 300:
        return AQICategory.POOR
    elif aqi_value <= 400:
        return AQICategory.VERY_POOR
    else:
        return AQICategory.SEVERE

def get_health_risk(aqi_value: float, condition: HealthCondition = None) -> str:
    # Baseline Risk logic
    if aqi_value <= 50:
        base_risk = "Low"
    elif aqi_value <= 100:
        base_risk = "Moderate"
    elif aqi_value <= 200:
        base_risk = "High"
    elif aqi_value <= 300:
        base_risk = "Very High"
    else:
        base_risk = "Critical"
        
    if not condition or condition == HealthCondition.NONE:
        return base_risk

    # Sensitive Groups Risk Amplification
    # If a sensitive group is exposed to Moderate AQI, risk escalates to High
    if aqi_value > 50 and aqi_value <= 100:
        return "High"
    elif aqi_value > 100 and aqi_value <= 200:
        return "Very High"
    elif aqi_value > 200:
        return "Critical"
        
    return base_risk
