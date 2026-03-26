import { motion } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import {
  FiTrendingUp, FiShoppingCart, FiPackage, FiStar,
  FiArrowUpRight, FiArrowDownRight, FiTruck, FiDollarSign,
  FiHeart, FiNavigation, FiX, FiCheck, FiClock
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
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
  'cancelled': 'badge-error',
  'confirmed': 'badge-success'
};

// ══════════════════ FARMER DASHBOARD ══════════════════
function FarmerDashboard({ name, uid }) {
  const [orders, setOrders] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(Array(12).fill(0));
  const [categoryIncome, setCategoryIncome] = useState([]);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'orders'), where('farmerId', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      let ordersList = [];
      let income = 0;
      let monthly = Array(12).fill(0);
      let catMap = {};
      let delivered = 0;
      let pending = 0;

      snap.forEach(docSnap => {
        const d = docSnap.data();
        const amount = d.totalAmount || 0;
        income += amount;

        // Monthly breakdown
        if (d.createdAt) {
          const date = d.createdAt.toDate();
          monthly[date.getMonth()] += amount;
        }

        // Category breakdown
        const cat = d.productCategory || d.productName || 'Other';
        catMap[cat] = (catMap[cat] || 0) + amount;

        // Status counts
        if (d.status === 'delivered' || d.status === 'confirmed') delivered++;
        if (d.status === 'pending') pending++;

        ordersList.push({
          id: docSnap.id.substring(0, 6).toUpperCase(),
          fullId: docSnap.id,
          buyer: d.buyerName || 'Guest',
          crop: d.productName,
          qty: `${d.quantity} ${d.unit}`,
          amount: amount,
          status: d.status || 'pending',
          date: d.createdAt?.toDate().toLocaleDateString('en-IN') || new Date().toLocaleDateString('en-IN'),
          ts: d.createdAt?.toMillis() || 0,
          paymentMethod: d.paymentMethod || 'online'
        });
      });

      ordersList.sort((a, b) => b.ts - a.ts);
      setOrders(ordersList);
      setTotalIncome(income);
      setTotalOrders(ordersList.length);
      setMonthlyIncome(monthly);
      setDeliveredCount(delivered);
      setPendingCount(pending);
      
      // Convert category map to array for doughnut
      const catArr = Object.entries(catMap).map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue).slice(0, 5);
      setCategoryIncome(catArr.length > 0 ? catArr : [{ name: 'None', revenue: 0 }]);
    }, (err) => console.warn('Live orders err:', err));
    return unsub;
  }, [uid]);

  const formatCurrency = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const statCards = [
    { label: 'Total Income', value: formatCurrency(totalIncome), change: totalIncome > 0 ? `₹${totalIncome.toLocaleString()}` : '₹0', up: totalIncome > 0, icon: <FiTrendingUp />, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Total Orders', value: totalOrders, change: `${deliveredCount} delivered`, up: true, icon: <FiShoppingCart />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Pending Orders', value: pendingCount, change: 'Needs attention', up: false, icon: <FiClock />, color: '#f97316', bg: '#fff7ed' },
    { label: 'Delivered', value: deliveredCount, change: totalOrders > 0 ? `${Math.round((deliveredCount / totalOrders) * 100)}% rate` : '0%', up: true, icon: <FiCheck />, color: '#22c55e', bg: '#f0fdf4' },
  ];

  const doughnutData = {
    labels: categoryIncome.map(c => c.name),
    datasets: [{
      data: categoryIncome.map(c => c.revenue),
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
          <div className="chart-header"><h3>Income Overview</h3><span className="badge badge-success">This Year</span></div>
          <div className="chart-body">
            <Line data={makeLineChart(monthlyIncome, '#22c55e', 'Income (₹)')} options={lineChartOptions} />
          </div>
        </motion.div>
        <motion.div className="chart-card chart-card-small" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="chart-header"><h3>Income by Product</h3></div>
          <div className="chart-body doughnut-body">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, font: { size: 11 } } } }, cutout: '70%' }} />
          </div>
        </motion.div>
      </div>

      <RecentOrdersTable orders={orders.slice(0, 10)} role="farmer" />
    </div>
  );
}

// ══════════════════ BUYER DASHBOARD ══════════════════
function BuyerDashboard({ name, uid }) {
  const [orders, setOrders] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(Array(12).fill(0));
  const [categorySpend, setCategorySpend] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'orders'), where('buyerId', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      let ordersList = [];
      let spent = 0;
      let monthly = Array(12).fill(0);
      let catMap = {};
      let pending = 0;
      let delivered = 0;

      snap.forEach(docSnap => {
        const d = docSnap.data();
        const amount = d.totalAmount || 0;
        spent += amount;

        if (d.createdAt) {
          const date = d.createdAt.toDate();
          monthly[date.getMonth()] += amount;
        }

        const cat = d.productCategory || d.productName || 'Other';
        catMap[cat] = (catMap[cat] || 0) + amount;

        if (d.status === 'pending') pending++;
        if (d.status === 'delivered' || d.status === 'confirmed') delivered++;

        ordersList.push({
          id: docSnap.id.substring(0, 6).toUpperCase(),
          fullId: docSnap.id,
          farmer: d.farmerName || 'Farmer',
          crop: d.productName,
          qty: `${d.quantity} ${d.unit}`,
          amount: amount,
          status: d.status || 'pending',
          date: d.createdAt?.toDate().toLocaleDateString('en-IN') || new Date().toLocaleDateString('en-IN'),
          ts: d.createdAt?.toMillis() || 0,
          paymentMethod: d.paymentMethod || 'online'
        });
      });

      ordersList.sort((a, b) => b.ts - a.ts);
      setOrders(ordersList);
      setTotalSpent(spent);
      setTotalOrders(ordersList.length);
      setMonthlySpend(monthly);
      setPendingCount(pending);
      setDeliveredCount(delivered);
      
      const catArr = Object.entries(catMap).map(([name, spend]) => ({ name, spend }))
        .sort((a, b) => b.spend - a.spend).slice(0, 5);
      setCategorySpend(catArr.length > 0 ? catArr : [{ name: 'None', spend: 0 }]);
    }, (err) => console.warn('Live orders err:', err));
    return unsub;
  }, [uid]);

  const formatCurrency = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'cancelled' });
    } catch (err) {
      console.error('Cancel order error:', err);
    }
  };

  const statCards = [
    { label: 'Total Spent', value: formatCurrency(totalSpent), change: totalSpent > 0 ? `₹${totalSpent.toLocaleString()}` : '₹0', up: true, icon: <FiDollarSign />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Total Orders', value: totalOrders, change: `${deliveredCount} completed`, up: true, icon: <FiShoppingCart />, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Pending', value: pendingCount, change: 'In progress', up: false, icon: <FiClock />, color: '#f97316', bg: '#fff7ed' },
    { label: 'Delivered', value: deliveredCount, change: totalOrders > 0 ? `${Math.round((deliveredCount / totalOrders) * 100)}% rate` : '0%', up: true, icon: <FiCheck />, color: '#22c55e', bg: '#f0fdf4' },
  ];

  const doughnutData = {
    labels: categorySpend.map(c => c.name),
    datasets: [{
      data: categorySpend.map(c => c.spend),
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
            <Line data={makeLineChart(monthlySpend, '#3b82f6', 'Spend (₹)')} options={lineChartOptions} />
          </div>
        </motion.div>
        <motion.div className="chart-card chart-card-small" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="chart-header"><h3>Spend by Category</h3></div>
          <div className="chart-body doughnut-body">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, font: { size: 11 } } } }, cutout: '70%' }} />
          </div>
        </motion.div>
      </div>

      <BuyerOrdersTable orders={orders} onCancel={handleCancelOrder} />
    </div>
  );
}

// ══════════════════ TRANSPORTER DASHBOARD ══════════════════
function TransporterDashboard({ name, uid }) {
  const [orders, setOrders] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(Array(12).fill(0));

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'orders'), where('transporterId', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      let ordersList = [];
      let earnings = 0;
      let deliveries = 0;
      let monthly = Array(12).fill(0);

      snap.forEach(docSnap => {
        const d = docSnap.data();
        const amount = d.transportFee || 0;
        earnings += amount;
        if (d.status === 'delivered') deliveries++;

        if (d.createdAt) {
          const date = d.createdAt.toDate();
          monthly[date.getMonth()] += amount;
        }

        ordersList.push({
          id: docSnap.id.substring(0, 6).toUpperCase(),
          from: d.farmerLocation || 'Origin',
          to: d.buyerLocation || 'Destination',
          cargo: d.productName || 'Goods',
          weight: `${d.quantity || 0} ${d.unit || 'kg'}`,
          amount: amount,
          status: d.status || 'pending',
          date: d.createdAt?.toDate().toLocaleDateString('en-IN') || new Date().toLocaleDateString('en-IN'),
          ts: d.createdAt?.toMillis() || 0
        });
      });

      ordersList.sort((a, b) => b.ts - a.ts);
      setOrders(ordersList);
      setTotalEarnings(earnings);
      setTotalDeliveries(deliveries);
      setMonthlyEarnings(monthly);
    }, (err) => console.warn('Live orders err:', err));
    return unsub;
  }, [uid]);

  const statCards = [
    { label: 'Total Earnings', value: totalEarnings > 0 ? `₹${(totalEarnings / 1000).toFixed(1)}K` : '₹0', change: `₹${totalEarnings.toLocaleString()}`, up: totalEarnings > 0, icon: <FiDollarSign />, color: '#f97316', bg: '#fff7ed' },
    { label: 'Deliveries Done', value: totalDeliveries, change: `${orders.length} total trips`, up: true, icon: <FiTruck />, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Active Trips', value: orders.filter(o => o.status === 'in-transit').length, change: 'On the move', up: true, icon: <FiNavigation />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, change: 'Awaiting pickup', up: false, icon: <FiClock />, color: '#eab308', bg: '#fefce8' },
  ];

  const doughnutData = {
    labels: orders.length > 0 ? ['Delivered', 'In Transit', 'Pending'] : ['None'],
    datasets: [{
      data: orders.length > 0
        ? [
            orders.filter(o => o.status === 'delivered').length,
            orders.filter(o => o.status === 'in-transit').length,
            orders.filter(o => o.status === 'pending').length
          ]
        : [1],
      backgroundColor: orders.length > 0 ? ['#22c55e', '#3b82f6', '#f97316'] : ['#e5e7eb'],
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
            <Line data={makeLineChart(monthlyEarnings, '#f97316', 'Earnings (₹)')} options={lineChartOptions} />
          </div>
        </motion.div>
        <motion.div className="chart-card chart-card-small" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="chart-header"><h3>Trip Status</h3></div>
          <div className="chart-body doughnut-body">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, font: { size: 11 } } } }, cutout: '70%' }} />
          </div>
        </motion.div>
      </div>

      <RecentOrdersTable orders={orders.slice(0, 10)} role="transporter" />
    </div>
  );
}

// ══════════════════ BUYER ORDERS TABLE (with manage actions) ══════════════════
function BuyerOrdersTable({ orders, onCancel }) {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(orders.map(order => ({
      'Order ID': order.id,
      'Farmer': order.farmer,
      'Crop': order.crop,
      'Quantity': order.qty,
      'Amount': order.amount,
      'Status': order.status,
      'Payment': order.paymentMethod,
      'Date': order.date,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `buyer_orders.xlsx`);
  };

  return (
    <motion.div className="orders-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <div className="chart-header">
        <h3>📦 My Orders</h3>
        <div>
          <button className="btn btn-sm btn-secondary" onClick={exportToExcel} style={{ marginRight: '10px' }}>Export Excel</button>
        </div>
      </div>
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Farmer</th>
              <th>Crop</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No orders yet. Visit the Marketplace to place your first order!
                </td>
              </tr>
            ) : (
              orders.map((order, i) => (
                <tr key={i}>
                  <td className="order-id">{order.id}</td>
                  <td>{order.farmer}</td>
                  <td>{order.crop}</td>
                  <td>{order.qty}</td>
                  <td className="order-amount">₹{order.amount.toLocaleString()}</td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      {order.paymentMethod || 'Online'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${statusColors[order.status] || 'badge-info'}`}>{order.status}</span>
                  </td>
                  <td className="order-date">{order.date}</td>
                  <td>
                    {order.status === 'pending' && (
                      <button
                        className="btn btn-sm"
                        style={{
                          background: '#fef2f2',
                          color: '#b91c1c',
                          border: '1px solid #fecaca',
                          fontSize: '0.75rem',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => onCancel(order.fullId)}
                      >
                        <FiX size={12} /> Cancel
                      </button>
                    )}
                    {(order.status === 'delivered' || order.status === 'confirmed') && (
                      <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 600 }}>✅ Done</span>
                    )}
                    {order.status === 'in-transit' && (
                      <span style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600 }}>🚚 On Way</span>
                    )}
                    {order.status === 'cancelled' && (
                      <span style={{ color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>❌</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ══════════════════ SHARED TABLE ══════════════════
function RecentOrdersTable({ orders, role }) {
  const headers = role === 'farmer'
    ? ['Order ID', 'Buyer', 'Crop', 'Qty', 'Amount', 'Status', 'Date']
    : ['Trip ID', 'From', 'To', 'Cargo', 'Weight', 'Amount', 'Status', 'Date'];

  const getRow = (order, role) => {
    if (role === 'farmer') return [order.id, order.buyer, order.crop, order.qty, `₹${order.amount.toLocaleString()}`, order.status, order.date];
    return [order.id, order.from, order.to, order.cargo, order.weight, `₹${order.amount.toLocaleString()}`, order.status, order.date];
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(orders.map(order => {
      if (role === 'farmer') return { 'Order ID': order.id, 'Buyer': order.buyer, 'Crop': order.crop, 'Quantity': order.qty, 'Amount': order.amount, 'Status': order.status, 'Date': order.date };
      return { 'Trip ID': order.id, 'From': order.from, 'To': order.to, 'Cargo': order.cargo, 'Weight': order.weight, 'Amount': order.amount, 'Status': order.status, 'Date': order.date };
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Records");
    XLSX.writeFile(wb, `${role}_records.xlsx`);
  };

  return (
    <motion.div className="orders-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <div className="chart-header">
        <h3>{role === 'transporter' ? 'Recent Trips' : 'Recent Orders'}</h3>
        <div>
          <button className="btn btn-sm btn-secondary" onClick={exportToExcel} style={{ marginRight: '10px' }}>Export Excel</button>
          <button className="btn btn-sm btn-secondary">View All</button>
        </div>
      </div>
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={headers.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No records yet
                </td>
              </tr>
            ) : (
              orders.map((order, i) => {
                const row = getRow(order, role);
                return (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className={
                        j === 0 ? 'order-id' :
                        cell?.toString().startsWith('₹') ? 'order-amount' :
                        j === row.length - 1 ? 'order-date' : ''
                      }>
                        {j === row.length - 2
                          ? <span className={`badge ${statusColors[cell] || 'badge-info'}`}>{cell}</span>
                          : cell}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ══════════════════ MAIN EXPORT ══════════════════
export default function Dashboard() {
  const { userProfile, profileLoading } = useAuth();

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

  const uid = userProfile?.uid || JSON.parse(localStorage.getItem('fc_user_profile') || '{}')?.uid;

  if (role === 'farmer')      return <FarmerDashboard      name={name} uid={uid} />;
  if (role === 'transporter') return <TransporterDashboard name={name} uid={uid} />;
  return <BuyerDashboard name={name} uid={uid} />;
}
