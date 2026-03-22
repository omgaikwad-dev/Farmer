import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle, FiBarChart2 } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { priceInsights } from '../data/mockData';
import './PriceInsights.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const chartData = {
  labels: priceInsights.map(p => p.crop),
  datasets: [
    {
      label: 'Current Price (₹/kg)',
      data: priceInsights.map(p => p.currentPrice),
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderRadius: 6
    },
    {
      label: 'Predicted Price (₹/kg)',
      data: priceInsights.map(p => p.predictedPrice),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 6
    }
  ]
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: { padding: 20, usePointStyle: true, font: { size: 12 } }
    },
    tooltip: {
      backgroundColor: '#1a1a1a',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ₹${ctx.parsed.y}`
      }
    }
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { callback: (v) => `₹${v}` }
    }
  }
};

export default function PriceInsights() {
  return (
    <div className="price-insights">
      <motion.div
        className="pi-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1>🤖 AI Price Insights</h1>
          <p>AI-powered price predictions to help you make better selling decisions</p>
        </div>
      </motion.div>

      {/* Alert */}
      <motion.div
        className="pi-alert"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FiAlertCircle size={20} />
        <div>
          <strong>🍅 Tomato price expected to rise by 29%!</strong>
          <span>Our AI recommends holding tomatoes for 3-5 more days for maximum profit.</span>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        className="pi-chart-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="chart-header">
          <h3><FiBarChart2 /> Current vs Predicted Prices</h3>
        </div>
        <div className="pi-chart-body">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Price Cards */}
      <div className="pi-cards">
        {priceInsights.map((item, i) => (
          <motion.div
            key={i}
            className="pi-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
          >
            <div className="pi-card-header">
              <h3>{item.crop}</h3>
              <span className={`pi-trend ${item.trend}`}>
                {item.trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
                {item.change}
              </span>
            </div>

            <div className="pi-prices">
              <div className="pi-price-item">
                <span className="pi-price-label">Current</span>
                <span className="pi-price-value">₹{item.currentPrice}/kg</span>
              </div>
              <div className="pi-price-arrow">{item.trend === 'up' ? '📈' : '📉'}</div>
              <div className="pi-price-item">
                <span className="pi-price-label">Predicted</span>
                <span className="pi-price-value predicted">₹{item.predictedPrice}/kg</span>
              </div>
            </div>

            <div className="pi-suggestion">
              <span>💡</span> {item.suggestion}
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Info */}
      <motion.div
        className="pi-info"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3>🧠 How does our AI work?</h3>
        <div className="pi-info-grid">
          <div className="pi-info-item">
            <span>📊</span>
            <div>
              <h4>Historical Data</h4>
              <p>Analyzes 5+ years of crop price data from mandis across India</p>
            </div>
          </div>
          <div className="pi-info-item">
            <span>🌦️</span>
            <div>
              <h4>Weather Patterns</h4>
              <p>Factors in weather forecasts and seasonal variations</p>
            </div>
          </div>
          <div className="pi-info-item">
            <span>📈</span>
            <div>
              <h4>Market Demand</h4>
              <p>Tracks demand signals from buyers across the platform</p>
            </div>
          </div>
          <div className="pi-info-item">
            <span>🗺️</span>
            <div>
              <h4>Regional Analysis</h4>
              <p>Considers location-specific supply and demand factors</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
