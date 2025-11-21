from flask import Flask, request, jsonify
from flask import Flask, request, jsonify
from inference_sdk import InferenceHTTPClient
from ultralytics import YOLO
import os
from flask_cors import CORS
from collections import Counter
import re
import requests
import cohere
import json
from pathlib import Path

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return "NutriScope backend is running!"

client = InferenceHTTPClient(
    api_url=" ",
    api_key=" "
)

indian_workflows = [
    {"workspace": "workspace_name", "workflow_id": "workflowid_name"},
    {"workspace": "workspace_name", "workflow_id": "workflowid_name"},
    {"workspace": "workspace_name", "workflow_id": "workflowid_name"}
]

MODEL_PATH = r"D:\NutriScope\backend\models\yolov8l.pt"
yolo_model = YOLO(MODEL_PATH)

DATA_DIR = Path(r"D:\NutriScope\data")
DATA_DIR.mkdir(parents=True, exist_ok=True)

YOLO_CONF_THRESHOLD = 0.6
INDIAN_CONF_THRESHOLD = 0.6

NUTRITIONIX_APP_ID = " "
NUTRITIONIX_API_KEY = " "
NUTRITIONIX_URL = " "

COHERE_API_KEY = " "
co = cohere.Client(COHERE_API_KEY)

def normalize_name(name):
    return re.sub(r'\W+', '', name.lower())

def get_nutrition(food_name):
    headers = {
        "x-app-id": NUTRITIONIX_APP_ID,
        "x-app-key": NUTRITIONIX_API_KEY,
        "Content-Type": "application/json"
    }
    data = {"query": food_name}
    try:
        response = requests.post(NUTRITIONIX_URL, headers=headers, json=data)
        response.raise_for_status()
        res_json = response.json()
        if "foods" in res_json and res_json["foods"]:
            food_info = res_json["foods"][0]
            return {
                "calories": food_info.get("nf_calories", 0),
                "protein_g": food_info.get("nf_protein", 0),
                "fat_g": food_info.get("nf_total_fat", 0),
                "carbs_g": food_info.get("nf_total_carbohydrate", 0)
            }
        else:
            return {}
    except Exception as e:
        print(f"[ERROR] Nutritionix API error: {str(e)}")
        return {}

def get_ai_nutrition(food_name):
    prompt = f"""
    Provide estimated nutrition info for '{food_name}'.
    Return JSON ONLY in this format:
    {{
        "calories": number,
        "protein_g": number,
        "fat_g": number,
        "carbs_g": number
    }}
    """
    try:
        response = co.chat(
            model="command-xlarge-nightly",
            message=prompt
        )
        text = response.text.strip() 
        try:
            nutrition_info = json.loads(text)
        except json.JSONDecodeError:
            print(f"[WARNING] Cohere returned invalid JSON. Trying to extract values manually.")
            calories = re.search(r'"calories"\s*:\s*([\d.]+)', text)
            protein = re.search(r'"protein_g"\s*:\s*([\d.]+)', text)
            fat = re.search(r'"fat_g"\s*:\s*([\d.]+)', text)
            carbs = re.search(r'"carbs_g"\s*:\s*([\d.]+)', text)
            nutrition_info = {
                "calories": float(calories.group(1)) if calories else 0,
                "protein_g": float(protein.group(1)) if protein else 0,
                "fat_g": float(fat.group(1)) if fat else 0,
                "carbs_g": float(carbs.group(1)) if carbs else 0
            }
        nutrition_info["source"] = "cohere_ai"
        return nutrition_info
    except Exception as e:
        print(f"[ERROR] Cohere AI nutrition error: {str(e)}")
        return {
            "calories": 0,
            "protein_g": 0,
            "fat_g": 0,
            "carbs_g": 0,
            "source": "fallback"
        }

def run_yolo_international(image_path):
    try:
        if yolo_model is None:
            return {"food": "Unknown", "confidence": 0, "type": "International", "error": "YOLO model not available"}
        results = yolo_model(image_path, imgsz=640) 
        detections = []
        ignore_classes = ["juice", "fork", "plate", "glass", "cup", "knife", "spoon", "bowl"]
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = yolo_model.names.get(class_id, "Unknown").lower()
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                area = (x2 - x1) * (y2 - y1)
                detections.append({
                    "class": class_name,
                    "confidence": confidence,
                    "area": area
                })
        detections = [d for d in detections if d["class"] not in ignore_classes]
        if not detections:
            return {"food": "Unknown", "confidence": 0, "type": "International"}
        class_counter = {}
        for d in detections:
            if d["class"] not in class_counter:
                class_counter[d["class"]] = {"count": 0, "total_area": 0, "max_conf": 0}
            class_counter[d["class"]]["count"] += 1
            class_counter[d["class"]]["total_area"] += d["area"]
            class_counter[d["class"]]["max_conf"] = max(class_counter[d["class"]]["max_conf"], d["confidence"])
        top_class = max(class_counter.items(), key=lambda x: x[1]["total_area"])
        selected_food = top_class[0]
        selected_conf = top_class[1]["max_conf"]
        return {
            "food": selected_food,
            "confidence": selected_conf,
            "type": "International"
        }
    except Exception as e:
        return {"food": "Unknown", "confidence": 0, "type": "International", "error": str(e)}

def run_indian_workflows(image_path):
    indian_predictions = []
    original_mapping = {}
    confidences = []
    for wf in indian_workflows:
        try:
            res = client.run_workflow(
                workspace_name=wf["workspace"],
                workflow_id=wf["workflow_id"],
                images={"image": image_path},
                use_cache=True
            )
            preds = res[0]["predictions"]["predictions"]
            for p in preds:
                conf = float(p["confidence"])
                if conf >= INDIAN_CONF_THRESHOLD:
                    orig_name = p["class"]
                    norm = normalize_name(orig_name)
                    indian_predictions.append(norm)
                    confidences.append(conf)
                    if norm not in original_mapping:
                        original_mapping[norm] = orig_name
        except Exception:
            continue
    if not indian_predictions:
        return None, None
    most_common_norm, count = Counter(indian_predictions).most_common(1)[0]
    avg_conf = sum(confidences) / len(confidences) if confidences else 0
    if count >= 2 and avg_conf >= INDIAN_CONF_THRESHOLD:
        return original_mapping[most_common_norm], avg_conf
    return None, None

def generate_nutrition_summary(nutrition):
    targets = {"calories": 500, "protein_g": 25, "fat_g": 20, "carbs_g": 50}
    summary = {}
    for key in ["calories", "protein_g", "fat_g", "carbs_g"]:
        value = nutrition.get(key, 0)
        target = targets[key]
        if key == "protein_g":
            if value < 0.7 * target:
                summary[key] = f"Low protein ({value}g) – consider increasing protein intake in upcoming meals."
            elif value > 1.3 * target:
                summary[key] = f"High protein ({value}g) – adequate for this meal, balance protein in next meals."
            else:
                summary[key] = f"Moderate protein ({value}g) – protein intake is well-balanced for this meal."
        elif key == "fat_g":
            if value < 0.5 * target:
                summary[key] = f"Low fat ({value}g) – acceptable for a light meal, ensure adequate intake later."
            elif value > 1.2 * target:
                summary[key] = f"High fat ({value}g) – consider moderating fat intake in subsequent meals."
            else:
                summary[key] = f"Moderate fat ({value}g) – fat intake is balanced for this meal."
        elif key == "carbs_g":
            if value < 0.5 * target:
                summary[key] = f"Low carbs ({value}g) – could increase carbohydrate intake if energy is needed."
            elif value > 1.2 * target:
                summary[key] = f"High carbs ({value}g) – watch portion sizes in the rest of the day."
            else:
                summary[key] = f"Moderate carbs ({value}g) – carbohydrate intake is balanced."
        else:
            if value < 0.5 * target:
                summary[key] = f"Low calories ({value} kcal) – light meal, ensure enough intake later."
            elif value > 1.2 * target:
                summary[key] = f"High calories ({value} kcal) – consider portion control for remaining meals."
            else:
                summary[key] = f"Moderate calories ({value} kcal) – reasonable calorie intake for this meal."
    return summary

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files or "food_type" not in request.form:
            return jsonify({"error": "No image uploaded or food_type missing"}), 400
        food_type = request.form["food_type"].lower()
        file = request.files["image"]
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        filename = file.filename
        save_path = DATA_DIR / filename
        file.save(str(save_path))
        print(f"[INFO] Processing {filename} as {food_type} food")
        if food_type == "international":
            result = run_yolo_international(str(save_path))
            final_food = result["food"]
            final_type = "International"
            print(f"[INFO] 🌍 International → {final_food} ({result.get('confidence',0):.2f})")
        elif food_type == "indian":
            indian_food, indian_conf = run_indian_workflows(str(save_path))
            if indian_food:
                final_food = indian_food
                final_type = "Indian"
                print(f"[INFO] ✅ Indian → {final_food} ({indian_conf:.2f})")
            else:
                final_food = "Unknown"
                final_type = "Indian"
                print(f"[INFO] ⚠️ Indian workflow returned no confident prediction")
        else:
            return jsonify({"error": "Invalid food_type. Choose 'Indian' or 'International'."}), 400
        nutrition_info = get_nutrition(final_food)
        if not nutrition_info:
            print(f"[INFO] Nutritionix failed → using AI for {final_food}")
            nutrition_info = get_ai_nutrition(final_food)
        nutrition_summary = generate_nutrition_summary(nutrition_info)
        final_result = {
            "food": final_food,
            "type": final_type,
            "nutrition": nutrition_info,
            "summary": nutrition_summary
        }
        print(f"[INFO] Prediction → {final_result}")
        return jsonify(final_result)
    except Exception as e:
        print(f"[ERROR] Prediction failed: {str(e)}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.route("/manual-nutrition", methods=["POST"])
def manual_nutrition():
    try:
        data = request.get_json()
        if not data or "food_name" not in data:
            return jsonify({"error": "Food name is required"}), 400
        food_name = data["food_name"]
        quantity = data.get("quantity", 100)
        unit = data.get("unit", "grams")
        nutrition_info = get_nutrition(food_name)
        if not nutrition_info:
            print(f"[INFO] Nutritionix failed → using AI for {food_name}")
            nutrition_info = get_ai_nutrition(food_name)
            source = "cohere_ai"
        else:
            source = "nutritionix"
        multiplier = unit == "count" and quantity or quantity / 100
        total_nutrition = {
            "calories": round(nutrition_info["calories"] * multiplier),
            "protein_g": round(nutrition_info["protein_g"] * multiplier, 1),
            "fat_g": round(nutrition_info["fat_g"] * multiplier, 1),
            "carbs_g": round(nutrition_info["carbs_g"] * multiplier, 1)
        }
        nutrition_summary = generate_nutrition_summary(nutrition_info)
        result = {
            "food_name": food_name,
            "quantity": quantity,
            "unit": unit,
            "nutrition": nutrition_info,
            "total_nutrition": total_nutrition,
            "summary": nutrition_summary,
            "source": source
        }
        return jsonify(result)
    except Exception as e:
        print(f"[ERROR] Manual nutrition calculation failed: {str(e)}")
        return jsonify({"error": "Failed to calculate nutrition information"}), 500

@app.route("/food-suggestions", methods=["GET"])
def food_suggestions():
    try:
        query = request.args.get("query", "")
        if not query:
            return jsonify({"common": [], "branded": []})
        url = "https://trackapi.nutritionix.com/v2/search/instant"
        headers = {
            "x-app-id": NUTRITIONIX_APP_ID,
            "x-app-key": NUTRITIONIX_API_KEY
        }
        params = {
            "query": query
        }
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        suggestions = []
        if "common" in data:
            for item in data["common"][:10]:
                suggestions.append({
                    "food_name": item["food_name"],
                    "calories": item.get("nf_calories", 0),
                    "serving_unit": item.get("serving_unit", ""),
                    "serving_qty": item.get("serving_qty", 1)
                })
        if "branded" in data:
            for item in data["branded"][:10]:
                suggestions.append({
                    "food_name": item["food_name"],
                    "brand_name": item.get("brand_name", ""),
                    "calories": item.get("nf_calories", 0),
                    "serving_unit": item.get("serving_unit", ""),
                    "serving_qty": item.get("serving_qty", 1)
                })
        
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        print(f"[ERROR] Food suggestions error: {str(e)}")
        return jsonify({"suggestions": []})

if __name__ == "__main__":
    app.run(debug=True, port=5000)