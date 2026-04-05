import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Scan, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw,
  Zap,
  TrendingUp,
  Activity,
  Info,
  Scale
} from 'lucide-react';
import './FoodDetector.css';

const FoodDetector = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foodType, setFoodType] = useState('international');
  const [dragOver, setDragOver] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('count');
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
    }
  };

  const generateSummary = (nutrition) => {
    const summary = {};

    if (nutrition.calories < 300)
      summary.calories = `${nutrition.calories} kcal – this is a low-calorie meal and may not provide sufficient energy on its own. Consider adding nutrient-dense foods if this is your main meal.`;
    else if (nutrition.calories <= 600)
      summary.calories = `${nutrition.calories} kcal – this meal provides a balanced amount of energy and fits well within a typical per-meal calorie range.`;
    else
      summary.calories = `${nutrition.calories} kcal – this is a high-calorie meal. Consider lighter meals later in the day to maintain overall calorie balance.`;

    if (nutrition.protein_g < 10)
      summary.protein_g = `${nutrition.protein_g}g protein – protein content is low. Including protein-rich foods in your next meal can help support muscle maintenance and improve satiety.`;
    else if (nutrition.protein_g <= 30)
      summary.protein_g = `${nutrition.protein_g}g protein – protein intake is adequate and supports muscle health and sustained fullness.`;
    else
      summary.protein_g = `${nutrition.protein_g}g protein – this is a high-protein meal, which is beneficial for muscle recovery and satiety. Balance protein intake across the day.`;

    if (nutrition.fat_g < 10)
      summary.fat_g = `${nutrition.fat_g}g fat – fat content is low. Ensure you include healthy fats in other meals for proper nutrient absorption and hormonal balance.`;
    else if (nutrition.fat_g <= 25)
      summary.fat_g = `${nutrition.fat_g}g fat – fat intake is moderate and appropriate for a balanced meal.`;
    else
      summary.fat_g = `${nutrition.fat_g}g fat – this meal is relatively high in fat. Consider moderating high-fat foods in upcoming meals to maintain dietary balance.`;

    if (nutrition.carbs_g < 30)
      summary.carbs_g = `${nutrition.carbs_g}g carbohydrates – carbohydrate content is low and may provide limited immediate energy. Additional carbs may be needed depending on your activity level.`;
    else if (nutrition.carbs_g <= 70)
      summary.carbs_g = `${nutrition.carbs_g}g carbohydrates – carbohydrate intake is balanced and provides a good source of energy for daily activities.`;
    else
      summary.carbs_g = `${nutrition.carbs_g}g carbohydrates – this is a high-carbohydrate meal. Monitoring portion sizes can help avoid excess daily intake.`;

    return summary;
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select an image!');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('food_type', foodType);

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.nutrition && !data.error) {
        const multiplier = unit === 'count' ? parseFloat(quantity) : parseFloat(quantity) / 100;
        data.nutrition.calories = Math.round(data.nutrition.calories * multiplier);
        data.nutrition.protein_g = Math.round(data.nutrition.protein_g * multiplier * 10) / 10;
        data.nutrition.fat_g = Math.round(data.nutrition.fat_g * multiplier * 10) / 10;
        data.nutrition.carbs_g = Math.round(data.nutrition.carbs_g * multiplier * 10) / 10;
        data.quantity = quantity;
        data.unit = unit;
        data.summary = generateSummary(data.nutrition);

      }
      
      setResult(data);
    } catch (error) {
      console.error('Error uploading image:', error);
      setResult({ error: 'Failed to get prediction' });
    }

    setLoading(false);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setLoading(false);
    setQuantity('1');
    setUnit('count');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getNutritionColor = (value, type) => {
    if (type === 'calories') {
      if (value < 250) return 'nutrition-low';
      if (value < 500) return 'nutrition-medium';
      return 'nutrition-high';
    }
    return 'nutrition-normal';
  };

  return (
    <div className="food-detector">
      <div className="detector-container">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="detector-header"
        >
          <h1>Food Detector</h1>
          <p>Upload an image of your food and get instant nutrition analysis.</p>
        </motion.div>

        <div className="detector-content">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="upload-section"
          >
            <div className="card glass-effect">
              <h3 className="card-title">
                <Zap className="icon" size={20} />
                Select Food Type
              </h3>
              <div className="food-type-grid">
                {['international', 'indian'].map((type) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFoodType(type)}
                    className={`food-type-btn ${
                      foodType === type ? 'food-type-active' : ''
                    }`}
                  >
                    <div className="food-type-label">{type}</div>
                    <div className="food-type-desc">
                      {type === 'international' ? 'Global cuisine' : 'Indian dishes'}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="card glass-effect">
              <h3 className="card-title">
                <Camera className="icon" size={20} />
                Upload Food Image
              </h3>
              
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`upload-area ${
                  dragOver ? 'upload-area-dragover' : ''
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  className="upload-input"
                />
                
                <div className="upload-content">
                  <div className="upload-icon">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="upload-text">
                      Drop your image here or click to browse
                    </p>
                    <p className="upload-subtext">
                      Supports JPG, PNG, WebP (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="quantity-section">
                <h3 className="card-title">
                  <Scale className="icon" size={20} />
                  Quantity
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="form-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="form-input"
                    >
                      <option value="count">Count/Pieces</option>
                      <option value="grams">Grams (g)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading}
                  className={`btn-analyze ${
                    !selectedFile || loading ? 'btn-disabled' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <Scan className="icon spin" size={20} />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="icon" size={20} />
                      <span>Analyze Food</span>
                    </>
                  )}
                </motion.button>

                {(selectedFile || result) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="btn-reset"
                  >
                    <RotateCcw className="icon" size={20} />
                    <span>Reset</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="results-section"
          >
            <AnimatePresence>
              {preview && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card glass-effect"
                >
                  <h3 className="card-title">Preview</h3>
                  <div className="preview-container">
                    <img
                      src={preview}
                      alt="preview"
                      className="preview-image"
                    />
                    
                    {loading && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="scanning-overlay"
                      >
                        <div className="scanning-container">
                          <motion.div
                            className="scanner-line"
                            animate={{ y: ['0%', '100%', '0%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        </div>
                        <div className="scanning-text">
                          <div className="scanning-content">
                            <Scan className="icon spin" size={24} />
                            <span>Scanning food...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence> 
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="results-cards"
                >
                  {result.error ? (
                    <div className="card glass-effect error-card">
                      <div className="error-header">
                        <AlertCircle className="icon error-icon" size={24} />
                        <h3>Error</h3>
                      </div>
                      <p className="error-text">{result.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="card glass-effect">
                        <div className="success-header">
                          <CheckCircle className="icon success-icon" size={24} />
                          <h3>Food Identified</h3>
                        </div>
                        <div className="food-result">
                          <div className="food-name">
                            {result.food}
                          </div>
                          <div className="food-type">
                            {result.type} Cuisine
                          </div>
                          <div className="food-quantity">
                            Quantity: {result.quantity || '1'} {result.unit === 'count' ? 'piece(s)' : 'grams'}
                          </div>
                        </div>
                      </div>

                      {result.nutrition && (
                        <div className="card glass-effect">
                          <div className="nutrition-header">
                            <TrendingUp className="icon nutrition-icon" size={24} />
                            <h3>Nutrition Facts</h3>
                            {result.nutrition.source && (
                              <div className="nutrition-source">
                                <span className={`source-badge ${
                                  result.nutrition.source === 'nutritionix' ? 'source-verified' : 'source-ai'
                                }`}>
                                  {result.nutrition.source === 'nutritionix' ? 
                                    '🔬 Verified Data' : 
                                    result.nutrition.source === 'cohere_ai' ?
                                      '🤖 AI Estimated' :
                                      '⚠️ Fallback Data'
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="nutrition-grid">
                            {[
                              { key: 'calories', label: 'Calories', unit: 'kcal', value: result.nutrition.calories },
                              { key: 'protein_g', label: 'Protein', unit: 'g', value: result.nutrition.protein_g },
                              { key: 'fat_g', label: 'Fat', unit: 'g', value: result.nutrition.fat_g },
                              { key: 'carbs_g', label: 'Carbs', unit: 'g', value: result.nutrition.carbs_g },
                            ].map((item) => (
                              <div key={item.key} className="nutrition-item">
                                <div className={`nutrition-value ${getNutritionColor(item.value, item.key)}`}>
                                  {item.value}
                                </div>
                                <div className="nutrition-label">
                                  {item.label} ({item.unit})
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {result.nutrition.source !== 'nutritionix' && (
                            <div className="ai-disclaimer">
                              <Info className="icon" size={16} />
                              <span>
                                {result.nutrition.source === 'cohere_ai' ?
                                  'AI-generated nutrition estimates based on food recognition.' :
                                  'Fallback nutrition data provided. Please verify with reliable sources for accurate information.'
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {result.summary && (
                        <div className="card glass-effect">
                          <div className="summary-header">
                            <Info className="icon summary-icon" size={24} />
                            <h3>Nutrition Insights</h3>
                          </div>
                          
                          <div className="summary-content">
                            {Object.entries(result.summary).map(([key, value]) => (
                              <div key={key} className="summary-item">
                                <div className="summary-title">
                                  {key.replace('_', ' ')}
                                </div>
                                <div className="summary-text">
                                  {value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetector;