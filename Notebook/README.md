# AirSense.AI Notebook Workflow

This directory contains the exploratory and model-development workflow for AirSense.AI AQI forecasting.

## Notebook Order

| Step | Notebook | Purpose |
| --- | --- | --- |
| 1 | `01_data_preparation.ipynb` | Load, clean, align, and prepare pollution and weather data. |
| 2 | `02_EDA.ipynb` | Explore AQI trends, pollutant behavior, weather effects, and outliers. |
| 3 | `03_feature_engineering.ipynb` | Build temporal, pollutant-ratio, lag, rolling, interaction, and weather-derived features. |
| 4 | `04_model_training.ipynb` | Train base tree models for AQI prediction. |
| 5 | `05_ensemble.ipynb` | Evaluate model combinations and export ensemble metadata. |
| 6 | `07_inference.ipynb` | Validate runtime inference against exported artifacts. |

## Expected Outputs

The backend prediction service expects the final training workflow to export:

- `catboost_model.pkl` or `catboost_model.cbm`
- `lightgbm_model.pkl`
- `xgboost_model.pkl` or `xgboost_model.json`
- `robust_scaler.pkl`
- `selected_features.pkl`
- `ensemble_metadata.pkl` or `ensemble_info.pkl`

Place the exported artifacts in one of the loader-visible directories:

1. Path defined by `ML_MODELS_DIR`
2. `backend/models`
3. `backend/backend/models`
4. `models`

## Reproducibility Notes

- Keep the feature order in `selected_features.pkl` synchronized with the trained scaler and models.
- Export the scaler from the same feature matrix used to train the final models.
- Preserve ensemble weights in metadata using keys such as `catboost_weight`, `lightgbm_weight`, and `xgboost_weight`, or a nested `weights` dictionary.
- Run the inference notebook before moving artifacts into the backend runtime.

## Runtime Link

Backend inference is implemented in:

- `backend/app/ml/model_loader.py`
- `backend/app/ml/feature_engineer.py`
- `backend/app/ml/predictor.py`
- `backend/app/services/ml_service.py`
