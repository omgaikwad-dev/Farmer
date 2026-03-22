import { motion } from 'framer-motion';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { dashboardStats } from '../data/mockData';
import './Analytics.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const revenueData = {
  labels: months,
  datasets: [{
    label: 'Revenue (₹)',
    data: dashboardStats.monthlySales,
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    fill: true,
    tension: 0.4,
    pointRadius: 4,
    pointBackgroundColor: '#22c55e'
  }]
};

const ordersData = {
  labels: months,
  datasets: [{
    label: 'Orders',
    data: [12, 15, 13, 20, 25, 22, 30, 28, 35, 32, 38, 42],
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    borderRadius: 6
  }]
};

const categoryData = {
  labels: ['Vegetables', 'Fruits', 'Grains', 'Spices', 'Dairy'],
  datasets: [{
    data: [35, 25, 20, 12, 8],
    backgroundColor: ['#22c55e', '#f97316', '#eab308', '#ef4444', '#06b6d4'],
    borderWidth: 0
  }]
};

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1a1a1a', padding: 12, cornerRadius: 8 }
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(0,0,0,0.04)' } }
  }
};

export default function Analytics() {
  const totalRevenue = dashboardStats.monthlySales.reduce((sum, v) => sum + v, 0);
  const totalOrders = dashboardStats.totalOrders;
  const avgOrderValue = Math.round(totalRevenue / totalOrders);

  return (
    <div className="analytics-page">
      <motion.div
        className="an-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>📊 Analytics Dashboard</h1>
        <p>Detailed insights into your farming business performance</p>
      </motion.div>

      {/* Summary Stats */}
      <div className="an-summary">
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: '💰', color: '#22c55e' },
          { label: 'Total Orders', value: totalOrders, icon: '📦', color: '#3b82f6' },
          { label: 'Avg Order Value', value: `₹${avgOrderValue}`, icon: '📈', color: '#f97316' },
          { label: 'Avg Rating', value: '4.5 ⭐', icon: '⭐', color: '#eab308' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="an-stat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <span className="an-stat-icon">{stat.icon}</span>
            <div className="an-stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="an-stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="an-charts-grid">
        <motion.div
          className="an-chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>📈 Revenue Trend</h3>
          <div className="an-chart-body"><Line data={revenueData} options={chartOpts} /></div>
        </motion.div>
        <motion.div
          className="an-chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>📦 Monthly Orders</h3>
          <div className="an-chart-body"><Bar data={ordersData} options={chartOpts} /></div>
        </motion.div>
      </div>

      <div className="an-charts-grid">
        <motion.div
          className="an-chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>🏆 Top Performing Crops</h3>
          <div className="top-crops-list">
            {dashboardStats.topCrops.map((crop, i) => (
              <div key={i} className="top-crop-item">
                <span className="tcp-rank">#{i + 1}</span>
                <div className="tcp-info">
                  <span className="tcp-name">{crop.name}</span>
                  <div className="tcp-bar-track">
                    <motion.div
                      className="tcp-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${(crop.revenue / dashboardStats.topCrops[0].revenue * 100)}%` }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    />
                  </div>
                </div>
                <span className="tcp-value">₹{(crop.revenue / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="an-chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3>🥧 Sales by Category</h3>
          <div className="an-chart-body doughnut">
            <Doughnut data={categoryData} options={{
              ...chartOpts,
              plugins: {
                ...chartOpts.plugins,
                legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } }
              },
              cutout: '65%'
            }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
