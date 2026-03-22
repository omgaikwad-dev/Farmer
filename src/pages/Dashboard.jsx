import { motion } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import {
  FiTrendingUp, FiShoppingCart, FiPackage, FiStar,
  FiArrowUpRight, FiArrowDownRight, FiTruck, FiDollarSign,
  FiHeart, FiNavigation
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { farmerDashboardStats, buyerDashboardStats, transporterDashboardStats } from '../data/mockData';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const makeLineChart = (data, color, label) => ({
  labels: months,
  datasets: [{
    label,
    data,
    borderColor: color,
    backgroundColor: `${color}14`,
    fill: true,
    tension: 0.4,
    pointBackgroundColor: color,
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 7
  }]
});

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a1a1a',
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#a3a3a3', font: { size: 11 } }
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: {
        color: '#a3a3a3',
        font: { size: 11 },
        callback: (v) => `₹${v / 1000}k`
      }
    }
  }
};

const statusColors = {
  'delivered': 'badge-success',
  'in-transit': 'badge-info',
  'pending': 'badge-warning',
  'processing': 'badge-info',
  'cancelled': 'badge-error'
};

// ══════════════════ FARMER DASHBOARD ══════════════════
function FarmerDashboard({ stats, name }) {
  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats.totalSales / 1000).toFixed(0)}K`, change: '+23%', up: true, icon: <FiTrendingUp />, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Total Orders', value: stats.totalOrders, change: '+12%', up: true, icon: <FiShoppingCart />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Active Listings', value: stats.activeListing, change: '+3', up: true, icon: <FiPackage />, color: '#f97316', bg: '#fff7ed' },
    { label: 'Avg Rating', value: stats.avgRating, change: '+0.2', up: true, icon: <FiStar />, color: '#eab308', bg: '#fefce8' },
  ];

  const doughnutData = {
    labels: stats.topCrops.map(c => c.name),
    datasets: [{
      data: stats.topCrops.map(c => c.revenue),
      backgroundColor: ['#22c55e', '#f97316', '#eab308', '#3b82f6', '#a855f7'],
      borderWidth: 0, hoverOffset: 8
    }]
  };

  return (
    <div className="dashboard">
      <motion.div className="dash-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1>Welcome back, {name} 👋</h1>
          <p>Here's what's happening with your farm today</p>
        </div>
        <div className="dash-date">
          📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </motion.div>

      <div className="stats-cards">
        {statCards.map((stat, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
            <div className="stat-card-info">
              <span className="stat-card-label">{stat.label}</span>
              <span className="stat-card-value">{stat.value}</span>
              <span className={`stat-card-change ${stat.up ? 'up' : 'down'}`}>
                {stat.up ? <FiArrowUpRight /> : <FiArrowDownRight />}{stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dash-charts">
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="chart-header"><h3>Revenue Overview</h3><span className="badge badge-success">This Year</span></div>
          <div className="chart-body">
            <Line data={makeLineChart(stats.monthlySales, '#22c55e', 'Revenue (₹)')} options={lineChartOptions} />
          </div>
        </motion.div>
        <motion.div className="chart-card chart-card-small" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="chart-header"><h3>Top Crops</h3></div>
          <div className="chart-body doughnut-body">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, font: { size: 11 } } } }, cutout: '70%' }} />
          </div>
        </motion.div>
      </div>

      <RecentOrdersTable orders={stats.recentOrders} role="farmer" />
    </div>
  );
}

// ══════════════════ BUYER DASHBOARD ══════════════════
function BuyerDashboard({ stats, name }) {
  const statCards = [
    { label: 'Total Spent', value: `₹${(stats.totalSpent / 1000).toFixed(0)}K`, change: '+18%', up: true, icon: <FiDollarSign />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Total Orders', value: stats.totalOrders, change: '+8%', up: true, icon: <FiShoppingCart />, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Saved Items', value: stats.savedProducts, change: '+5', up: true, icon: <FiHeart />, color: '#ec4899', bg: '#fdf2f8' },
    { label: 'Avg Rating', value: stats.avgRating, change: '+0.1', up: true, icon: <FiStar />, color: '#eab308', bg: '#fefce8' },
  ];

  const doughnutData = {
    labels: stats.topCategories.map(c => c.name),
    datasets: [{
      data: stats.topCategories.map(c => c.spend),
      backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#06b6d4', '#f97316'],
      borderWidth: 0, hoverOffset: 8
    }]
  };

  return (
    <div className="dashboard">
      <motion.div className="dash-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1>Hello, {name} 👋</h1>
          <p>Here's your purchase summary</p>
        </div>
        <div className="dash-date">
          📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </motion.div>

      <div className="stats-cards">
        {statCards.map((stat, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
            <div className="stat-card-info">
              <span className="stat-card-label">{stat.label}</span>
              <span className="stat-card-value">{stat.value}</span>
              <span className={`stat-card-change ${stat.up ? 'up' : 'down'}`}>
                {stat.up ? <FiArrowUpRight /> : <FiArrowDownRight />}{stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dash-charts">
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="chart-header"><h3>Monthly Spend</h3><span className="badge badge-info">This Year</span></div>
          <div className="chart-body">
            <Line data={makeLineChart(stats.monthlySpend, '#3b82f6', 'Spend (₹)')} options={lineChartOptions} />
          </div>
        </motion.div>
        <motion.div className="chart-card chart-card-small" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="chart-header"><h3>Spend by Category</h3></div>
          <div className="chart-body doughnut-body">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, font: { size: 11 } } } }, cutout: '70%' }} />
          </div>
        </motion.div>
      </div>

      <RecentOrdersTable orders={stats.recentOrders} role="buyer" />
    </div>
  );
}

// ══════════════════ TRANSPORTER DASHBOARD ══════════════════
function TransporterDashboard({ stats, name }) {
  const statCards = [
    { label: 'Total Earnings', value: `₹${(stats.totalEarnings / 1000).toFixed(0)}K`, change: '+20%', up: true, icon: <FiDollarSign />, color: '#f97316', bg: '#fff7ed' },
    { label: 'Deliveries Done', value: stats.totalDeliveries, change: '+15%', up: true, icon: <FiTruck />, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Active Trips', value: stats.activeTrips, change: '+1', up: true, icon: <FiNavigation />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Avg Rating', value: stats.avgRating, change: '+0.3', up: true, icon: <FiStar />, color: '#eab308', bg: '#fefce8' },
  ];

  const doughnutData = {
    labels: stats.vehicleTypes.map(v => v.name),
    datasets: [{
      data: stats.vehicleTypes.map(v => v.earnings),
      backgroundColor: ['#f97316', '#22c55e', '#06b6d4', '#a855f7'],
      borderWidth: 0, hoverOffset: 8
    }]
  };

  return (
    <div className="dashboard">
      <motion.div className="dash-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1>Welcome, {name} 🚛</h1>
          <p>Your transport operations at a glance</p>
        </div>
        <div className="dash-date">
          📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </motion.div>

      <div className="stats-cards">
        {statCards.map((stat, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
            <div className="stat-card-info">
              <span className="stat-card-label">{stat.label}</span>
              <span className="stat-card-value">{stat.value}</span>
              <span className={`stat-card-change ${stat.up ? 'up' : 'down'}`}>
                {stat.up ? <FiArrowUpRight /> : <FiArrowDownRight />}{stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dash-charts">
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="chart-header"><h3>Monthly Earnings</h3><span className="badge badge-warning">This Year</span></div>
          <div className="chart-body">
            <Line data={makeLineChart(stats.monthlyEarnings, '#f97316', 'Earnings (₹)')} options={lineChartOptions} />
          </div>
        </motion.div>
        <motion.div className="chart-card chart-card-small" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="chart-header"><h3>By Vehicle Type</h3></div>
          <div className="chart-body doughnut-body">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, font: { size: 11 } } } }, cutout: '70%' }} />
          </div>
        </motion.div>
      </div>

      <RecentOrdersTable orders={stats.recentOrders} role="transporter" />
    </div>
  );
}

// ══════════════════ SHARED TABLE ══════════════════
function RecentOrdersTable({ orders, role }) {
  const headers = role === 'farmer'
    ? ['Order ID', 'Buyer', 'Crop', 'Qty', 'Amount', 'Status', 'Date']
    : role === 'buyer'
      ? ['Order ID', 'Farmer', 'Crop', 'Qty', 'Amount', 'Status', 'Date']
      : ['Trip ID', 'From', 'To', 'Cargo', 'Weight', 'Amount', 'Status', 'Date'];

  const getRow = (order, role) => {
    if (role === 'farmer') return [order.id, order.buyer, order.crop, order.qty, `₹${order.amount.toLocaleString()}`, order.status, order.date];
    if (role === 'buyer') return [order.id, order.farmer, order.crop, order.qty, `₹${order.amount.toLocaleString()}`, order.status, order.date];
    return [order.id, order.from, order.to, order.cargo, order.weight, `₹${order.amount.toLocaleString()}`, order.status, order.date];
  };

  return (
    <motion.div className="orders-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <div className="chart-header">
        <h3>{role === 'transporter' ? 'Recent Trips' : 'Recent Orders'}</h3>
        <button className="btn btn-sm btn-secondary">View All</button>
      </div>
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {orders.map((order, i) => {
              const row = getRow(order, role);
              return (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className={
                      j === 0 ? 'order-id' :
                      cell?.toString().startsWith('₹') ? 'order-amount' :
                      j === row.length - 1 ? 'order-date' : ''
                    }>
                      {(j === row.length - 2 && role !== 'transporter') || (j === row.length - 2 && role === 'transporter')
                        ? <span className={`badge ${statusColors[cell] || 'badge-info'}`}>{cell}</span>
                        : cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ══════════════════ MAIN EXPORT ══════════════════
export default function Dashboard() {
  const { userProfile, profileLoading } = useAuth();

  // Show spinner only while profile is actively being fetched
  if (profileLoading && !userProfile) {
    return (
      <div className="dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 16px' }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // Get role: userProfile → localStorage cache → 'buyer' fallback
  let role = userProfile?.role;
  let name = userProfile?.name;

  if (!role) {
    try {
      const cached = JSON.parse(localStorage.getItem('fc_user_profile') || 'null');
      if (cached) {
        role = cached.role;
        name = name || cached.name;
      }
    } catch (_) {}
  }

  role = role || 'buyer';
  name = name || 'User';

  if (role === 'farmer')      return <FarmerDashboard      stats={farmerDashboardStats}      name={name} />;
  if (role === 'transporter') return <TransporterDashboard stats={transporterDashboardStats} name={name} />;
  return <BuyerDashboard stats={buyerDashboardStats} name={name} />;
}

