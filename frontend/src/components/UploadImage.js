import React, { useState } from "react";

const UploadImage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foodType, setFoodType] = useState("international");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setResult(null);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("food_type", foodType);

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error uploading image:", error);
      setResult({ error: "Failed to get prediction" });
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <h2>NutriScope Food Detector</h2>
      <form onSubmit={handleAnalyze}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <br /><br />
        <label>
          Select Food Type:{" "}
          <select value={foodType} onChange={(e) => setFoodType(e.target.value)}>
            <option value="international">International</option>
            <option value="indian">Indian</option>
          </select>
        </label>
        <br /><br />
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {preview && (
        <div style={{ position: "relative", marginTop: "20px", display: "inline-block" }}>
          <h3>Uploaded Image:</h3>
          <img
            src={preview}
            alt="preview"
            style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", display: "block" }}
          />

          {loading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                overflow: "hidden",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "4px",
                  backgroundColor: "limegreen",
                  animation: "scan 1.5s linear infinite",
                }}
              />
            </div>
          )}

          <style>
            {`
              @keyframes scan {
                0% { top: 0%; }
                50% { top: 96%; }
                100% { top: 0%; }
              }
            `}
          </style>
        </div>
      )}

      {result && !result.error && (
        <div style={{ marginTop: "20px" }}>
          <h3>Prediction:</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold", color: "#2E8B57" }}>
            {result.food} ({result.type})
          </p>

          {result.nutrition && (
            <div style={{ marginTop: "10px", textAlign: "left", display: "inline-block" }}>
              <h4>Nutrition Info:</h4>
              <p>Calories: {result.nutrition.calories} kcal</p>
              <p>Protein: {result.nutrition.protein_g} g</p>
              <p>Fat: {result.nutrition.fat_g} g</p>
              <p>Carbs: {result.nutrition.carbs_g} g</p>
            </div>
          )}

          {result.summary && (
            <div style={{ marginTop: "10px", textAlign: "left", display: "inline-block" }}>
              <h4>Nutrition Summary:</h4>
              {Object.entries(result.summary).map(([key, value]) => (
                <p key={key}>{value}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {result && result.error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <p>{result.error}</p>
        </div>
      )}
    </div>
  );
};

export default UploadImage;