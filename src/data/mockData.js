export const cropCategories = [
  { id: 'fruits', name: 'Fruits', icon: '🍎', color: '#ef4444' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬', color: '#22c55e' },
  { id: 'grains', name: 'Grains', icon: '🌾', color: '#eab308' },
  { id: 'pulses', name: 'Pulses', icon: '🫘', color: '#a855f7' },
  { id: 'spices', name: 'Spices', icon: '🌶️', color: '#f97316' },
  { id: 'dairy', name: 'Dairy', icon: '🥛', color: '#06b6d4' },
  { id: 'oilseeds', name: 'Oil Seeds', icon: '🌻', color: '#84cc16' },
  { id: 'flowers', name: 'Flowers', icon: '🌸', color: '#ec4899' }
];

export const sampleProducts = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    category: 'vegetables',
    price: 45,
    unit: 'kg',
    quantity: 500,
    location: 'Nashik, Maharashtra',
    farmerName: 'Rajesh Patil',
    farmerId: 'farmer1',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&q=80',
    description: 'Fresh organic tomatoes grown without pesticides. Rich red color and excellent taste.',
    available: true,
    organic: true,
    harvestDate: '2026-03-20'
  },
  {
    id: '2',
    name: 'Basmati Rice',
    category: 'grains',
    price: 85,
    unit: 'kg',
    quantity: 2000,
    location: 'Dehradun, Uttarakhand',
    farmerName: 'Amit Singh',
    farmerId: 'farmer2',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&q=80',
    description: 'Premium quality Basmati rice with long grains and amazing aroma.',
    available: true,
    organic: false,
    harvestDate: '2026-03-15'
  },
  {
    id: '3',
    name: 'Alphonso Mangoes',
    category: 'fruits',
    price: 350,
    unit: 'dozen',
    quantity: 200,
    location: 'Ratnagiri, Maharashtra',
    farmerName: 'Suresh Deshmukh',
    farmerId: 'farmer3',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80',
    description: 'Premium Alphonso mangoes, known as the king of mangoes. Sweet and juicy.',
    available: true,
    organic: true,
    harvestDate: '2026-03-18'
  },
  {
    id: '4',
    name: 'Fresh Spinach',
    category: 'vegetables',
    price: 30,
    unit: 'bunch',
    quantity: 300,
    location: 'Pune, Maharashtra',
    farmerName: 'Meena Jadhav',
    farmerId: 'farmer4',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
    description: 'Freshly harvested green spinach, rich in iron and nutrients.',
    available: true,
    organic: true,
    harvestDate: '2026-03-21'
  },
  {
    id: '5',
    name: 'Turmeric Powder',
    category: 'spices',
    price: 180,
    unit: 'kg',
    quantity: 100,
    location: 'Erode, Tamil Nadu',
    farmerName: 'Karthik Raman',
    farmerId: 'farmer5',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=400&q=80',
    description: 'High curcumin content turmeric powder, freshly ground from farm.',
    available: true,
    organic: true,
    harvestDate: '2026-03-10'
  },
  {
    id: '6',
    name: 'Fresh Potatoes',
    category: 'vegetables',
    price: 25,
    unit: 'kg',
    quantity: 1000,
    location: 'Agra, Uttar Pradesh',
    farmerName: 'Vikram Yadav',
    farmerId: 'farmer6',
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber78?w=400&q=80',
    description: 'Farm fresh potatoes, ideal for all cooking purposes.',
    available: true,
    organic: false,
    harvestDate: '2026-03-19'
  },
  {
    id: '7',
    name: 'Organic Wheat',
    category: 'grains',
    price: 35,
    unit: 'kg',
    quantity: 5000,
    location: 'Indore, Madhya Pradesh',
    farmerName: 'Gopal Sharma',
    farmerId: 'farmer7',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
    description: 'Premium organic wheat, ideal for making chapati and bread.',
    available: true,
    organic: true,
    harvestDate: '2026-03-12'
  },
  {
    id: '8',
    name: 'Fresh Milk',
    category: 'dairy',
    price: 55,
    unit: 'litre',
    quantity: 200,
    location: 'Anand, Gujarat',
    farmerName: 'Bharat Patel',
    farmerId: 'farmer8',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
    description: 'Fresh cow milk delivered daily from our farm.',
    available: true,
    organic: true,
    harvestDate: '2026-03-22'
  },
  {
    id: '9',
    name: 'Red Onions',
    category: 'vegetables',
    price: 32,
    unit: 'kg',
    quantity: 800,
    location: 'Nashik, Maharashtra',
    farmerName: 'Anil Bhosale',
    farmerId: 'farmer9',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80',
    description: 'Premium red onions with strong flavor, freshly harvested.',
    available: true,
    organic: false,
    harvestDate: '2026-03-17'
  },
  {
    id: '10',
    name: 'Green Chillies',
    category: 'spices',
    price: 60,
    unit: 'kg',
    quantity: 150,
    location: 'Guntur, Andhra Pradesh',
    farmerName: 'Ramesh Reddy',
    farmerId: 'farmer10',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&q=80',
    description: 'Fresh green chillies, spicy and aromatic, straight from Guntur.',
    available: true,
    organic: true,
    harvestDate: '2026-03-20'
  },
  {
    id: '11',
    name: 'Toor Dal',
    category: 'pulses',
    price: 130,
    unit: 'kg',
    quantity: 600,
    location: 'Gulbarga, Karnataka',
    farmerName: 'Siddappa Patil',
    farmerId: 'farmer11',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
    description: 'Premium quality toor dal, great protein source for everyday meals.',
    available: true,
    organic: false,
    harvestDate: '2026-03-08'
  },
  {
    id: '12',
    name: 'Sunflower Seeds',
    category: 'oilseeds',
    price: 90,
    unit: 'kg',
    quantity: 400,
    location: 'Bidar, Karnataka',
    farmerName: 'Prakash Nayak',
    farmerId: 'farmer12',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1591965509026-5f4ae4b2d04f?w=400&q=80',
    description: 'Fresh sunflower seeds, perfect for oil extraction and snacking.',
    available: true,
    organic: true,
    harvestDate: '2026-03-14'
  },
  {
    id: '13',
    name: 'Marigold Flowers',
    category: 'flowers',
    price: 80,
    unit: 'kg',
    quantity: 100,
    location: 'Bangalore, Karnataka',
    farmerName: 'Lakshmi Devi',
    farmerId: 'farmer13',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc2c?w=400&q=80',
    description: 'Bright yellow and orange marigolds for festivals and decoration.',
    available: true,
    organic: true,
    harvestDate: '2026-03-22'
  },
  {
    id: '14',
    name: 'Organic Carrots',
    category: 'vegetables',
    price: 40,
    unit: 'kg',
    quantity: 350,
    location: 'Ooty, Tamil Nadu',
    farmerName: 'Selvam Kumar',
    farmerId: 'farmer14',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&q=80',
    description: 'Sweet organic carrots from the Nilgiri hills, rich in beta-carotene.',
    available: true,
    organic: true,
    harvestDate: '2026-03-19'
  },
  {
    id: '15',
    name: 'Black Pepper',
    category: 'spices',
    price: 650,
    unit: 'kg',
    quantity: 80,
    location: 'Wayanad, Kerala',
    farmerName: 'Thomas Mathew',
    farmerId: 'farmer15',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=400&q=80',
    description: 'Premium black pepper, the king of spices from Kerala.',
    available: true,
    organic: true,
    harvestDate: '2026-03-05'
  },
  {
    id: '16',
    name: 'Sweet Bananas',
    category: 'fruits',
    price: 50,
    unit: 'dozen',
    quantity: 500,
    location: 'Jalgaon, Maharashtra',
    farmerName: 'Dilip More',
    farmerId: 'farmer16',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&q=80',
    description: 'Fresh Khandesh bananas, naturally ripened and sweet.',
    available: true,
    organic: false,
    harvestDate: '2026-03-21'
  },
  {
    id: '17',
    name: 'Organic Paneer',
    category: 'dairy',
    price: 280,
    unit: 'kg',
    quantity: 100,
    location: 'Ludhiana, Punjab',
    farmerName: 'Gurpreet Singh',
    farmerId: 'farmer17',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
    description: 'Fresh homemade paneer from organic cow milk.',
    available: true,
    organic: true,
    harvestDate: '2026-03-22'
  },
  {
    id: '18',
    name: 'Masoor Dal',
    category: 'pulses',
    price: 110,
    unit: 'kg',
    quantity: 450,
    location: 'Bhopal, Madhya Pradesh',
    farmerName: 'Raju Verma',
    farmerId: 'farmer18',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1612257416659-6fe69b8b69af?w=400&q=80',
    description: 'Red lentils, rich in protein and fiber. Ideal for dal and soups.',
    available: true,
    organic: false,
    harvestDate: '2026-03-11'
  },
  {
    id: '19',
    name: 'Watermelons',
    category: 'fruits',
    price: 20,
    unit: 'kg',
    quantity: 1200,
    location: 'Kolhapur, Maharashtra',
    farmerName: 'Manoj Chavan',
    farmerId: 'farmer19',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80',
    description: 'Juicy red watermelons, sweet and refreshing.',
    available: true,
    organic: false,
    harvestDate: '2026-03-22'
  },
  {
    id: '20',
    name: 'Groundnut Oil',
    category: 'oilseeds',
    price: 160,
    unit: 'litre',
    quantity: 250,
    location: 'Rajkot, Gujarat',
    farmerName: 'Ramji Patel',
    farmerId: 'farmer20',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    description: 'Cold-pressed groundnut oil with natural aroma and flavor.',
    available: true,
    organic: true,
    harvestDate: '2026-03-09'
  }
];

export const weatherData = {
  current: {
    temp: 32,
    humidity: 65,
    windSpeed: 12,
    condition: 'Partly Cloudy',
    icon: '⛅',
    location: 'Maharashtra, India'
  },
  forecast: [
    { day: 'Mon', temp: 33, icon: '☀️', condition: 'Sunny' },
    { day: 'Tue', temp: 31, icon: '⛅', condition: 'Partly Cloudy' },
    { day: 'Wed', temp: 28, icon: '🌧️', condition: 'Light Rain' },
    { day: 'Thu', temp: 26, icon: '⛈️', condition: 'Thunderstorm' },
    { day: 'Fri', temp: 30, icon: '☀️', condition: 'Sunny' },
    { day: 'Sat', temp: 32, icon: '☀️', condition: 'Sunny' },
    { day: 'Sun', temp: 29, icon: '🌤️', condition: 'Mostly Sunny' }
  ],
  alerts: [
    { type: 'warning', message: 'Heavy rainfall expected on Wednesday. Secure your harvested crops.' },
    { type: 'info', message: 'Ideal conditions for sowing wheat observed on Friday.' }
  ]
};

export const priceInsights = [
  { crop: 'Tomato', currentPrice: 45, predictedPrice: 58, trend: 'up', change: '+29%', suggestion: 'Hold for 3-5 days for better prices' },
  { crop: 'Onion', currentPrice: 30, predictedPrice: 35, trend: 'up', change: '+17%', suggestion: 'Slight increase expected next week' },
  { crop: 'Potato', currentPrice: 25, predictedPrice: 22, trend: 'down', change: '-12%', suggestion: 'Sell now before prices drop' },
  { crop: 'Rice', currentPrice: 85, predictedPrice: 88, trend: 'up', change: '+4%', suggestion: 'Stable prices, sell at convenience' },
  { crop: 'Wheat', currentPrice: 35, predictedPrice: 40, trend: 'up', change: '+14%', suggestion: 'Wait for harvest season demand' },
  { crop: 'Mango', currentPrice: 350, predictedPrice: 320, trend: 'down', change: '-9%', suggestion: 'Sell soon as season peaks' }
];

// ——— Farmer Dashboard ———
export const farmerDashboardStats = {
  totalSales: 245000,
  totalOrders: 156,
  activeListing: 8,
  avgRating: 4.5,
  monthlySales: [18000, 22000, 19500, 28000, 35000, 32000, 41000, 38500, 45000, 42000, 48000, 52000],
  topCrops: [
    { name: 'Tomatoes', revenue: 65000, orders: 45 },
    { name: 'Rice', revenue: 52000, orders: 30 },
    { name: 'Mangoes', revenue: 48000, orders: 25 },
    { name: 'Wheat', revenue: 38000, orders: 35 },
    { name: 'Turmeric', revenue: 28000, orders: 20 }
  ],
  recentOrders: [
    { id: 'ORD001', buyer: 'Fresh Mart Ltd.', crop: 'Tomatoes', qty: '50 kg', amount: 2250, status: 'delivered', date: '2026-03-22' },
    { id: 'ORD002', buyer: 'Anand Hotels', crop: 'Rice', qty: '100 kg', amount: 8500, status: 'in-transit', date: '2026-03-21' },
    { id: 'ORD003', buyer: 'Kiran Stores', crop: 'Mangoes', qty: '5 dozen', amount: 1750, status: 'pending', date: '2026-03-21' },
    { id: 'ORD004', buyer: 'Metro Wholesale', crop: 'Wheat', qty: '200 kg', amount: 7000, status: 'delivered', date: '2026-03-20' },
    { id: 'ORD005', buyer: 'Green Basket', crop: 'Spinach', qty: '30 bunch', amount: 900, status: 'processing', date: '2026-03-20' }
  ]
};

// ——— Buyer Dashboard ———
export const buyerDashboardStats = {
  totalSpent: 132000,
  totalOrders: 48,
  savedProducts: 12,
  avgRating: 4.6,
  monthlySpend: [8000, 9500, 11000, 14000, 13000, 17000, 15000, 14500, 18000, 20000, 22000, 24000],
  topCategories: [
    { name: 'Vegetables', spend: 38000, orders: 20 },
    { name: 'Grains', spend: 32000, orders: 12 },
    { name: 'Fruits', spend: 28000, orders: 8 },
    { name: 'Dairy', spend: 18000, orders: 5 },
    { name: 'Spices', spend: 12000, orders: 3 }
  ],
  recentOrders: [
    { id: 'ORD101', farmer: 'Rajesh Patil', crop: 'Tomatoes', qty: '20 kg', amount: 900, status: 'delivered', date: '2026-03-22' },
    { id: 'ORD102', farmer: 'Amit Singh', crop: 'Basmati Rice', qty: '50 kg', amount: 4250, status: 'in-transit', date: '2026-03-21' },
    { id: 'ORD103', farmer: 'Suresh Deshmukh', crop: 'Alphonso Mangoes', qty: '3 dozen', amount: 1050, status: 'pending', date: '2026-03-21' },
    { id: 'ORD104', farmer: 'Gopal Sharma', crop: 'Organic Wheat', qty: '100 kg', amount: 3500, status: 'delivered', date: '2026-03-20' },
    { id: 'ORD105', farmer: 'Meena Jadhav', crop: 'Fresh Spinach', qty: '10 bunch', amount: 300, status: 'processing', date: '2026-03-20' }
  ]
};

// ——— Transporter Dashboard ———
export const transporterDashboardStats = {
  totalEarnings: 85000,
  totalDeliveries: 98,
  activeTrips: 3,
  avgRating: 4.4,
  monthlyEarnings: [5000, 6500, 7000, 8200, 9100, 8800, 10000, 9500, 11000, 10500, 12000, 13500],
  vehicleTypes: [
    { name: 'Mini Truck', earnings: 28000, trips: 40 },
    { name: 'Pickup', earnings: 22000, trips: 30 },
    { name: 'Refrigerated', earnings: 19000, trips: 18 },
    { name: 'Large Truck', earnings: 16000, trips: 10 }
  ],
  recentOrders: [
    { id: 'TRP001', from: 'Nashik', to: 'Mumbai', cargo: 'Tomatoes', weight: '500 kg', amount: 3500, status: 'delivered', date: '2026-03-22' },
    { id: 'TRP002', from: 'Pune', to: 'Delhi', cargo: 'Mangoes', weight: '200 kg', amount: 8200, status: 'in-transit', date: '2026-03-21' },
    { id: 'TRP003', from: 'Indore', to: 'Bhopal', cargo: 'Wheat', weight: '2000 kg', amount: 4100, status: 'pending', date: '2026-03-21' },
    { id: 'TRP004', from: 'Erode', to: 'Chennai', cargo: 'Turmeric', weight: '100 kg', amount: 2800, status: 'delivered', date: '2026-03-20' },
    { id: 'TRP005', from: 'Anand', to: 'Ahmedabad', cargo: 'Milk', weight: '400 L', amount: 1500, status: 'processing', date: '2026-03-20' }
  ]
};

// Kept for backwards compatibility
export const dashboardStats = farmerDashboardStats;

export const transportOptions = [
  { id: 't1', type: 'Mini Truck', capacity: '500 kg', pricePerKm: 12, icon: '🛻', available: true },
  { id: 't2', type: 'Pickup Truck', capacity: '1000 kg', pricePerKm: 18, icon: '🚛', available: true },
  { id: 't3', type: 'Large Truck', capacity: '5000 kg', pricePerKm: 25, icon: '🚚', available: true },
  { id: 't4', type: 'Refrigerated Van', capacity: '800 kg', pricePerKm: 30, icon: '🧊', available: true },
  { id: 't5', type: 'Bike Delivery', capacity: '50 kg', pricePerKm: 8, icon: '🏍️', available: true }
];
