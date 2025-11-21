# NutriScope – Intelligent Food Detection & Nutrition Estimation System

A web-based deep learning application that detects food items from images or manual text input and estimates their nutritional values (calories, protein, fat, carbohydrates). The system combines **YOLOv8L** and **Roboflow-trained models** for accurate detection of both Indian and international foods, using a Flask + React.js architecture.

# Features:

## Image-based Food Detection:
- Upload a food image to automatically detect the food item.
- Uses YOLOv8L for international cuisines and 3 Roboflow models for Indian dishes.
- Extracts the food name and retrieves nutritional values using the Nutritionix API.
- Displays calories, proteins, fats, and carbohydrates based on user-specified quantity.

## Manual Input Mode:
- Users can enter the food name and quantity manually (e.g., "Dosa – 100 grams").
- Retrieves and displays nutrition information in real time.
- Provides a nutrition summary with healthy-eating suggestions.

## General:
- Dual input modes: Image upload and Manual entry.
- Works entirely through a web browser, no installation or login required.
- Fast detection and nutrition computation through integrated Flask backend.
- Responsive and interactive React.js frontend with smooth UI animations.

# Technologies Used:
- **Python (Flask)** – Backend framework for model inference and API integration.
- **React.js** – Frontend framework for interactive user interface.
- **YOLOv8L** – Deep learning model for international food detection.
- **Roboflow Workflows** – Three separate YOLO models trained for Indian cuisines.
- **Nutritionix API** – For fetching real-time nutrition data.

# Project Structure:
```
NutriScope/
│
├── backend/
│   ├── app.py
│   ├── models/
│   │   └── yolov8l.pt
│   ├── requirements.txt
│   └── venv/
│
├── data/
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── HomePage.js / HomePage.css
│   │   │   ├── FoodDetector.js / FoodDetector.css
│   │   │   ├── UploadImage.js
│   │   │   ├── Navbar.js / Navbar.css
│   │   │   └── logo.svg
│   ├── package.json
│   └── package-lock.json
│
├── requirements.txt
├── .gitignore
└── README.md
```

# Datasets and Models Used:

## Indian Food Detection Projects:
- [IndianFoodNet](https://universe.roboflow.com/indianfoodnet/indianfoodnet)
- [Indian Food YOLOv5](https://universe.roboflow.com/food-detection-zgbkk/indian-food-yolov5-cfepx)
- [South Indian Food Detection](https://universe.roboflow.com/bharani-1ucid/south-indian-food-detection)

## International Food Detection:
- YOLOv8L Model – Pretrained global food model from Ultralytics.

## Nutrition API:
- [Nutritionix API](https://developer.nutritionix.com)

# How It Works:
- User uploads a food image or enters food name manually.
- Flask backend sends the input to the respective YOLO model for detection.
- The detected food name is passed to the Nutritionix API to fetch nutritional values.
- Nutrient data is scaled based on user-specified quantity (grams or pieces).
- React frontend displays a clean nutrition summary including calories, protein, fats, and carbs.

# Results:
- Successfully detects both Indian and international foods using YOLOv8L and Roboflow workflows.
- Provides real-time nutrition estimation using Nutritionix API with Cohere AI fallback when API data is unavailable.
- Supports image-based and manual entry modes, giving nutrient values (calories, protein, fat, carbs) scaled based on the user’s quantity input.
- Offers Nutrition Insights, helping users understand whether their meal is low, moderate, or high in key nutrients.
- Delivers responses with an average backend processing time of a few seconds, depending on image size and model used.

# Future Enhancements:
- Add user login and nutrition history tracking.
- Enable multiple food detection in a single image.
- Develop mobile app version for real-time camera detection.
- Integrate personalized dietary recommendations.
- Expand datasets for regional cuisines and traditional foods.

# Credits:
- YOLOv8 (Ultralytics) – Object Detection Framework.
- Roboflow Datasets – Indian food datasets and annotation tools.
- Nutritionix API – Real-time nutrition data provider.
