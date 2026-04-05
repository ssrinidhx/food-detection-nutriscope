import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Apple, Scale, Package, TrendingUp, Activity, Info } from 'lucide-react';
import './ManualFoodInput.css';

const ManualFoodInput = () => {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('grams');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const foodNameRef = useRef(null);

  useEffect(() => {
    if (foodName.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/food-suggestions?query=${encodeURIComponent(foodName)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(data.suggestions && data.suggestions.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [foodName]);

  const handleFoodNameChange = (e) => {
    setFoodName(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setFoodName(suggestion.food_name);
    setSuggestions([]);
    setShowSuggestions(false);
    
    setTimeout(() => {
      document.getElementById('quantity')?.focus();
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const generateSummary = (nutrition) => {
    const targets = {
      calories: 500,
      protein_g: 25,
      fat_g: 20,
      carbs_g: 50,
    };

    const summary = {};

    Object.keys(targets).forEach((key) => {
      const value = nutrition[key] || 0;
      const target = targets[key];

      if (key === "protein_g") {
        if (value < 0.7 * target)
          summary[key] = `Low protein (${value}g) – consider increasing protein intake in your next meal to support muscle health and satiety.`;
        else if (value > 1.3 * target)
          summary[key] = `High protein (${value}g) – good for muscle recovery, but balance protein intake across the day.`;
        else
          summary[key] = `Moderate protein (${value}g) – protein intake is well-balanced for this meal.`;
      }

      else if (key === "fat_g") {
        if (value < 0.5 * target)
          summary[key] = `Low fat (${value}g) – ensure adequate healthy fats in later meals for proper nutrient absorption.`;
        else if (value > 1.2 * target)
          summary[key] = `High fat (${value}g) – consider reducing high-fat foods in upcoming meals.`;
        else
          summary[key] = `Moderate fat (${value}g) – fat intake is balanced for this meal.`;
      }

      else if (key === "carbs_g") {
        if (value < 0.5 * target)
          summary[key] = `Low carbohydrates (${value}g) – you may need additional carbs later for sustained energy.`;
        else if (value > 1.2 * target)
          summary[key] = `High carbohydrates (${value}g) – monitor portions to avoid excess daily intake.`;
        else
          summary[key] = `Moderate carbohydrates (${value}g) – carbohydrate intake is well-balanced.`;
      }

      else if (key === "calories") {
        if (value < 0.5 * target)
          summary[key] = `Low calorie intake (${value} kcal) – this is a light meal; ensure adequate energy intake later.`;
        else if (value > 1.2 * target)
          summary[key] = `High calorie intake (${value} kcal) – consider lighter meals later to maintain balance.`;
        else
          summary[key] = `Moderate calorie intake (${value} kcal) – energy intake is appropriate for this meal.`;
      }
    });

    return summary;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodName.trim()) {
      setError('Please enter a food name');
      return;
    }

    if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setShowSuggestions(false);

    try {
      const response = await fetch('http://127.0.0.1:5000/manual-nutrition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          food_name: foodName,
          quantity: parseFloat(quantity),
          unit: unit
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.total_nutrition) {
          data.summary = generateSummary(data.total_nutrition);
        }
        setResult(data);
      } else {
        setError(data.error || 'Failed to fetch nutrition data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (foodNameRef.current && !foodNameRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="manual-food-input">
      <div className="container">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="header"
        >
          <h1>Manual Food Entry</h1>
          <p>Enter your food manually to get detailed nutrition information</p>
        </motion.div>

        <div className="content">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="input-section card glass-effect"
          >
            <h3 className="card-title">
              <Apple className="icon" size={20} />
              Enter Food Details
            </h3>
            
            <form onSubmit={handleSubmit} className="food-form">
              <div className="form-group" ref={foodNameRef}>
                <label htmlFor="foodName">Food Name</label>
                <div className="autocomplete-container">
                  <input
                    id="foodName"
                    type="text"
                    placeholder="e.g., Idly, Apple, Chicken Breast"
                    value={foodName}
                    onChange={handleFoodNameChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => foodName.length >= 2 && setSuggestions(suggestions)}
                    className="form-input autocomplete-input"
                  />
                  {showSuggestions && (
                    <ul className="suggestions-list glass-effect">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className={`suggestion-item ${index === selectedIndex ? 'suggestion-selected' : ''}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="suggestion-main">
                            <span className="suggestion-name">{suggestion.food_name}</span>
                            {suggestion.brand_name && (
                              <span className="suggestion-brand">{suggestion.brand_name}</span>
                            )}
                          </div>
                          <div className="suggestion-details">
                            {suggestion.calories > 0 && (
                              <span className="suggestion-calories">
                                {Math.round(suggestion.calories)} kcal
                              </span>
                            )}
                            <span className="suggestion-serving">
                              {suggestion.serving_qty} {suggestion.serving_unit}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    id="quantity"
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
                  <label htmlFor="unit">Unit</label>
                  <select
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="form-input"
                  >
                    <option value="grams">Grams (g)</option>
                    <option value="count">Count/Pieces</option>
                  </select>
                </div>
              </div>
              
              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`btn-submit ${loading ? 'btn-loading' : ''}`}
              >
                {loading ? (
                  <>
                    <Activity className="icon spin" size={20} />
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <Search className="icon" size={20} />
                    <span>Get Nutrition Info</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="results-section"
          >
            {result && !loading && (
              <div className="results-container">
                <div className="card glass-effect">
                  <div className="result-header">
                    <h3 className="card-title">
                      <Scale className="icon" size={20} />
                      Nutrition Analysis
                    </h3>
                    <div className="food-summary">
                      <h2>{result.food_name}</h2>
                      <p>{quantity} {unit === 'grams' ? 'grams' : unit === 'count' ? 'piece(s)' : ''}</p>
                    </div>
                  </div>
                  
                  <div className="card glass-effect">
                    <div className="nutrition-header">
                      <TrendingUp className="icon nutrition-icon" size={24} />
                      <h3>Nutrition Facts</h3>
                      <div className="nutrition-source">
                        <span className={`source-badge ${
                          result.source === 'nutritionix' ? 'source-verified' : 'source-ai'
                        }`}>
                          {result.source === 'nutritionix' ? 
                            '🔬 Verified Data' : 
                            '🤖 AI Estimated'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="nutrition-grid">
                      {[
                        { key: 'calories', label: 'Calories', unit: 'kcal', value: result.total_nutrition.calories },
                        { key: 'protein_g', label: 'Protein', unit: 'g', value: result.total_nutrition.protein_g },
                        { key: 'fat_g', label: 'Fat', unit: 'g', value: result.total_nutrition.fat_g },
                        { key: 'carbs_g', label: 'Carbs', unit: 'g', value: result.total_nutrition.carbs_g },
                      ].map((item) => (
                        <div key={item.key} className="nutrition-item">
                          <div className={`nutrition-value ${
                            item.key === 'calories' ? 
                              (item.value < 200 ? 'nutrition-low' : item.value < 500 ? 'nutrition-medium' : 'nutrition-high') :
                              'nutrition-normal'
                          }`}>
                            {item.value}
                          </div>
                          <div className="nutrition-label">
                            {item.label} ({item.unit})
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {result.source !== 'nutritionix' && (
                      <div className="ai-disclaimer">
                        <Info className="icon" size={16} />
                        <span>
                          AI-generated nutrition estimates based on food given.
                        </span>
                      </div>
                    )}
                  </div>
                  
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
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ManualFoodInput;