import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Zap, Shield, Target, ArrowRight, Star, Users, Award } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
  const features = [
    {
      icon: Camera,
      title: 'Food Recognition',
      description: 'Upload any food image and get instant identificatio.',
    },
    {
      icon: Zap,
      title: 'Instant Nutrition Analysis',
      description: 'Get detailed nutritional information including calories, proteins, fats, and carbohydrates.',
    },
    {
      icon: Target,
      title: 'Personalized Insights',
      description: 'Receive customized nutrition recommendations based on your meal analysis.',
    },
    {
      icon: Shield,
      title: 'Accurate Results',
      description: 'Leveraging YOLO and specialized Indian food detection for maximum accuracy.',
    }
  ];

  const stats = [
    { number: '10K+', label: 'Foods Analyzed', icon: Camera },
    { number: '95%', label: 'Accuracy Rate', icon: Target }
  ];

  return (
    <div className="homepage">
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hero-section"
      >
        <div className="hero-content">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hero-text"
          >
            <h1 className="hero-title">NutriScope</h1>
            <p className="hero-subtitle">Your Smart Nutrition Coach</p>
          </motion.div>

          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="hero-description"
          >
            Transform your nutrition journey with cutting-edge Smart technology. 
            Simply upload a photo of your meal and discover detailed nutritional insights, 
            personalized recommendations, and smart coaching tips.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="hero-buttons"
          >
            <Link to="/detector">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                <Camera size={24} />
                <span>Start Analyzing Food</span>
                <ArrowRight size={20} />
              </motion.button>
            </Link>
    
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="stats-section"
      >
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="stat-item"
              >
                <div className="stat-icon">
                  <Icon size={28} />
                </div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="features-section"
      >
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="features-header"
        >
          <h2>Powerful Features</h2>
          <p>Experience the future of nutrition tracking with our advanced AI-powered features</p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="feature-card glass-effect"
              >
                <div className="feature-icon">
                  <Icon size={32} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="cta-section"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="cta-content"
        >
          <Award size={64} className="cta-icon" />
          <h2>Ready to Transform Your Nutrition?</h2>
          <p>
            Join thousands of users who have already discovered the power of AI-driven nutrition coaching. 
            Start your journey to better health today.
          </p>
          <Link to="/detector">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-cta"
            >
              <Camera size={24} />
              <span>Get Started Now</span>
              <ArrowRight size={20} />
            </motion.button>
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default HomePage;