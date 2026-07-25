from app.models.enums import HealthCondition
from app.utils.health_risk import get_aqi_threshold, get_health_category, should_trigger_alert, calculate_health_risk

class HealthRiskService:
    @staticmethod
    def get_aqi_threshold(condition: HealthCondition) -> int:
        return get_aqi_threshold(condition)

    @staticmethod
    def get_health_category(aqi: float) -> str:
        return get_health_category(aqi)

    @staticmethod
    def should_trigger_alert(current_aqi: float, threshold: int) -> bool:
        return should_trigger_alert(current_aqi, threshold)

    @staticmethod
    def calculate_health_risk(aqi: float, condition: HealthCondition) -> float:
        return calculate_health_risk(aqi, condition)
