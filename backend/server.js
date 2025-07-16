const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Admin dashboard is now served from separate admin-server.js on port 8080

// Database paths
const dbPath = path.join(__dirname, 'database');
const ordersPath = path.join(dbPath, 'orders.json');
const featuredItemsPath = path.join(dbPath, 'featured-items.json');
const pizzaMenuPath = path.join(dbPath, 'pizza-menu.json');
const toppingsPath = path.join(dbPath, 'toppings.json');
const extraToppingsPath = path.join(dbPath, 'extra-toppings.json');
const ordersStatusPath = path.join(dbPath, 'orders-status.json');

// Ensure database directory exists
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

// Helper functions for database operations
const readDatabase = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading database:', error);
    return [];
  }
};

const writeDatabase = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
};

// Initialize database files if they don't exist
const initializeDatabase = () => {
  // Initialize orders
  if (!fs.existsSync(ordersPath)) {
    writeDatabase(ordersPath, []);
  }

  // Initialize featured items
  if (!fs.existsSync(featuredItemsPath)) {
    const initialFeaturedItems = [
      {
        id: 1,
        name: "PEPPERONI PIE",
        price: "$28.00",
        rating: "95%",
        reviews: "(452)",
        badge: "#1 Most liked",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        description: "Lunch size pizza - feeds one hungry pizza lover - our pepperoni: red sauce, 48 pepperonis",
        ingredients: ["Red sauce", "Mozzarella cheese", "Pepperoni", "Italian herbs"],
        category: "pizza",
        isActive: true
      },
      {
        id: 2,
        name: "FORMAGGIO PIE",
        price: "$21.00",
        rating: "95%",
        reviews: "(280)",
        badge: "#3 Most liked",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        description: "Classic cheese pizza with our signature red sauce and premium mozzarella cheese",
        ingredients: ["Red sauce", "Premium mozzarella cheese", "Italian herbs", "Olive oil"],
        category: "pizza",
        isActive: true
      },
      {
        id: 3,
        name: "FUNGHI PIE",
        price: "$28.00",
        rating: "96%",
        reviews: "(331)",
        badge: "#2 Most liked",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        description: "Mushroom lover's dream with fresh mushrooms, mozzarella, and our signature red sauce",
        ingredients: ["Red sauce", "Mozzarella cheese", "Fresh mushrooms", "Italian herbs", "Garlic"],
        category: "pizza",
        isActive: true
      }
    ];
    writeDatabase(featuredItemsPath, initialFeaturedItems);
  }

  // Initialize pizza menu
  if (!fs.existsSync(pizzaMenuPath)) {
    writeDatabase(pizzaMenuPath, []);
  }

  // Initialize toppings with quantity options
  if (!fs.existsSync(toppingsPath)) {
    const initialToppings = [
      { 
        id: 'pepperoni', 
        name: 'Pepperoni', 
        quantities: {
          normal: { price: 2.50, label: 'Normal' },
          extra: { price: 3.75, label: 'Extra' },
          double: { price: 5.00, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'mushrooms', 
        name: 'Mushrooms', 
        quantities: {
          normal: { price: 1.75, label: 'Normal' },
          extra: { price: 2.50, label: 'Extra' },
          double: { price: 3.50, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'sausage', 
        name: 'Italian Sausage', 
        quantities: {
          normal: { price: 3.00, label: 'Normal' },
          extra: { price: 4.25, label: 'Extra' },
          double: { price: 6.00, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'peppers', 
        name: 'Bell Peppers', 
        quantities: {
          normal: { price: 1.50, label: 'Normal' },
          extra: { price: 2.25, label: 'Extra' },
          double: { price: 3.00, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'onions', 
        name: 'Red Onions', 
        quantities: {
          normal: { price: 1.25, label: 'Normal' },
          extra: { price: 1.75, label: 'Extra' },
          double: { price: 2.50, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'olives', 
        name: 'Black Olives', 
        quantities: {
          normal: { price: 2.00, label: 'Normal' },
          extra: { price: 2.75, label: 'Extra' },
          double: { price: 4.00, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'cheese', 
        name: 'Extra Cheese', 
        quantities: {
          normal: { price: 2.50, label: 'Normal' },
          extra: { price: 3.75, label: 'Extra' },
          double: { price: 5.00, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'ham', 
        name: 'Ham', 
        quantities: {
          normal: { price: 2.75, label: 'Normal' },
          extra: { price: 4.00, label: 'Extra' },
          double: { price: 5.50, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'bacon', 
        name: 'Bacon', 
        quantities: {
          normal: { price: 3.25, label: 'Normal' },
          extra: { price: 4.75, label: 'Extra' },
          double: { price: 6.50, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'pineapple', 
        name: 'Pineapple', 
        quantities: {
          normal: { price: 2.25, label: 'Normal' },
          extra: { price: 3.25, label: 'Extra' },
          double: { price: 4.50, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'tomatoes', 
        name: 'Cherry Tomatoes', 
        quantities: {
          normal: { price: 1.50, label: 'Normal' },
          extra: { price: 2.25, label: 'Extra' },
          double: { price: 3.00, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'spinach', 
        name: 'Fresh Spinach', 
        quantities: {
          normal: { price: 1.75, label: 'Normal' },
          extra: { price: 2.50, label: 'Extra' },
          double: { price: 3.50, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'anchovies', 
        name: 'Anchovies', 
        quantities: {
          normal: { price: 3.00, label: 'Normal' },
          extra: { price: 4.25, label: 'Extra' },
          double: { price: 6.00, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'jalapenos', 
        name: 'Jalapeños', 
        quantities: {
          normal: { price: 1.50, label: 'Normal' },
          extra: { price: 2.25, label: 'Extra' },
          double: { price: 3.00, label: 'Double' }
        },
        isActive: true 
      },
      { 
        id: 'arugula', 
        name: 'Arugula', 
        quantities: {
          normal: { price: 2.00, label: 'Normal' },
          extra: { price: 2.75, label: 'Extra' },
          double: { price: 4.00, label: 'Double' }
        },
        isActive: true 
      }
    ];
    writeDatabase(toppingsPath, initialToppings);
  }

  // Initialize extra toppings
  if (!fs.existsSync(extraToppingsPath)) {
    const initialExtraToppings = {
      extraCheese: { name: 'Extra Cheese', price: 3.00, isActive: true },
      extraMeat: { name: 'Extra Meat', price: 4.00, isActive: true },
      extraVeg: { name: 'Extra Vegetables', price: 2.50, isActive: true }
    };
    writeDatabase(extraToppingsPath, initialExtraToppings);
  }

  // Initialize orders status
  if (!fs.existsSync(ordersStatusPath)) {
    const initialOrdersStatus = {
      isOpen: true,
      message: "Online orders are currently closed. Please try again later.",
      lastUpdated: new Date().toISOString()
    };
    writeDatabase(ordersStatusPath, initialOrdersStatus);
  }
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Join admin room for real-time updates
  socket.on('join-admin', () => {
    socket.join('admin');
    console.log('Admin joined:', socket.id);
  });

  // Join customer room for order tracking
  socket.on('join-customer', (orderId) => {
    socket.join(`customer-${orderId}`);
    console.log(`Customer joined tracking for order ${orderId}:`, socket.id);
  });

  // Leave customer room
  socket.on('leave-customer', (orderId) => {
    socket.leave(`customer-${orderId}`);
    console.log(`Customer left tracking for order ${orderId}:`, socket.id);
  });
});

// ORDERS API ENDPOINTS
app.get('/api/orders', (req, res) => {
  const orders = readDatabase(ordersPath);
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { pizza, quantity, isGlutenFree, extraToppings, totalPrice, customerInfo } = req.body;
  
  const newOrder = {
    id: uuidv4(),
    pizza,
    quantity,
    isGlutenFree,
    extraToppings: extraToppings || {
      extraCheese: false,
      extraMeat: false,
      extraVeg: false
    },
    totalPrice,
    customerInfo: customerInfo || {
      name: 'Customer',
      phone: '123-456-7890',
      address: '123 Main St'
    },
    status: 'received',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const orders = readDatabase(ordersPath);
  orders.push(newOrder);
  writeDatabase(ordersPath, orders);

  // Emit real-time update to admin
  io.to('admin').emit('new-order', newOrder);

  res.json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const orders = readDatabase(ordersPath);
  const orderIndex = orders.findIndex(order => order.id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  writeDatabase(ordersPath, orders);

  // Emit real-time update to admin and customer
  io.to('admin').emit('order-status-updated', orders[orderIndex]);
  io.to(`customer-${id}`).emit('order-status-updated', orders[orderIndex]);

  res.json(orders[orderIndex]);
});

// ORDER TRACKING API ENDPOINTS
app.get('/api/orders/:id/track', (req, res) => {
  const { id } = req.params;
  const orders = readDatabase(ordersPath);
  const order = orders.find(order => order.id === id);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Return order with tracking information
  const trackingInfo = {
    id: order.id,
    status: order.status,
    pizza: order.pizza,
    quantity: order.quantity,
    totalPrice: order.totalPrice,
    customerInfo: order.customerInfo,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    statusHistory: getOrderStatusHistory(order),
    estimatedDelivery: calculateEstimatedDelivery(order)
  };

  res.json(trackingInfo);
});

// Helper function to get order status history
const getOrderStatusHistory = (order) => {
  const statusSteps = [
    { status: 'received', label: 'Order Received', icon: '📋' },
    { status: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { status: 'in-oven', label: 'In Oven', icon: '🔥' },
    { status: 'ready', label: 'Ready', icon: '✅' },
    { status: 'out-for-delivery', label: 'Out for Delivery', icon: '🚚' },
    { status: 'delivered', label: 'Delivered', icon: '🎉' }
  ];

  const currentStatusIndex = statusSteps.findIndex(step => step.status === order.status);
  
  return statusSteps.map((step, index) => ({
    ...step,
    completed: index <= currentStatusIndex,
    current: index === currentStatusIndex,
    timestamp: index <= currentStatusIndex ? order.updatedAt : null
  }));
};

// Helper function to calculate estimated delivery time
const calculateEstimatedDelivery = (order) => {
  const createdTime = new Date(order.createdAt);
  const statusTimes = {
    'received': 0,
    'preparing': 5,
    'in-oven': 15,
    'ready': 25,
    'out-for-delivery': 30,
    'delivered': 45
  };
  
  const estimatedMinutes = statusTimes[order.status] || 0;
  const estimatedTime = new Date(createdTime.getTime() + estimatedMinutes * 60000);
  
  return estimatedTime.toISOString();
};

// FEATURED ITEMS API ENDPOINTS
app.get('/api/featured-items', (req, res) => {
  const items = readDatabase(featuredItemsPath);
  res.json(items);
});

app.post('/api/featured-items', (req, res) => {
  const newItem = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const items = readDatabase(featuredItemsPath);
  items.push(newItem);
  writeDatabase(featuredItemsPath, items);

  res.json(newItem);
});

app.put('/api/featured-items/:id', (req, res) => {
  const { id } = req.params;
  const items = readDatabase(featuredItemsPath);
  const itemIndex = items.findIndex(item => item.id === parseInt(id));
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  items[itemIndex] = {
    ...items[itemIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  writeDatabase(featuredItemsPath, items);
  res.json(items[itemIndex]);
});

app.delete('/api/featured-items/:id', (req, res) => {
  const { id } = req.params;
  const items = readDatabase(featuredItemsPath);
  const filteredItems = items.filter(item => item.id !== parseInt(id));
  
  writeDatabase(featuredItemsPath, filteredItems);
  res.json({ message: 'Item deleted successfully' });
});

// PIZZA MENU API ENDPOINTS
app.get('/api/pizza-menu', (req, res) => {
  const menu = readDatabase(pizzaMenuPath);
  res.json(menu);
});

app.post('/api/pizza-menu', (req, res) => {
  const newPizza = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const menu = readDatabase(pizzaMenuPath);
  menu.push(newPizza);
  writeDatabase(pizzaMenuPath, menu);

  res.json(newPizza);
});

app.put('/api/pizza-menu/:id', (req, res) => {
  const { id } = req.params;
  const menu = readDatabase(pizzaMenuPath);
  const pizzaIndex = menu.findIndex(pizza => pizza.id === parseInt(id));
  
  if (pizzaIndex === -1) {
    return res.status(404).json({ error: 'Pizza not found' });
  }

  menu[pizzaIndex] = {
    ...menu[pizzaIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  writeDatabase(pizzaMenuPath, menu);
  res.json(menu[pizzaIndex]);
});

app.delete('/api/pizza-menu/:id', (req, res) => {
  const { id } = req.params;
  const menu = readDatabase(pizzaMenuPath);
  const filteredMenu = menu.filter(pizza => pizza.id !== parseInt(id));
  
  writeDatabase(pizzaMenuPath, filteredMenu);
  res.json({ message: 'Pizza deleted successfully' });
});

// TOPPINGS API ENDPOINTS
app.get('/api/toppings', (req, res) => {
  const toppings = readDatabase(toppingsPath);
  res.json(toppings);
});

app.post('/api/toppings', (req, res) => {
  const { name, quantities, isActive = true } = req.body;
  
  // Default quantity structure if not provided
  const defaultQuantities = {
    normal: { price: 2.00, label: 'Normal' },
    extra: { price: 3.00, label: 'Extra' },
    double: { price: 4.00, label: 'Double' }
  };
  
  const newTopping = {
    id: uuidv4(),
    name,
    quantities: quantities || defaultQuantities,
    isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const toppings = readDatabase(toppingsPath);
  toppings.push(newTopping);
  writeDatabase(toppingsPath, toppings);

  res.json(newTopping);
});

app.put('/api/toppings/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantities, isActive } = req.body;
  
  const toppings = readDatabase(toppingsPath);
  const toppingIndex = toppings.findIndex(topping => topping.id === id);
  
  if (toppingIndex === -1) {
    return res.status(404).json({ error: 'Topping not found' });
  }

  toppings[toppingIndex] = {
    ...toppings[toppingIndex],
    name: name || toppings[toppingIndex].name,
    quantities: quantities || toppings[toppingIndex].quantities,
    isActive: isActive !== undefined ? isActive : toppings[toppingIndex].isActive,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(toppingsPath, toppings);
  res.json(toppings[toppingIndex]);
});

app.delete('/api/toppings/:id', (req, res) => {
  const { id } = req.params;
  const toppings = readDatabase(toppingsPath);
  const filteredToppings = toppings.filter(topping => topping.id !== id);
  
  writeDatabase(toppingsPath, filteredToppings);
  res.json({ message: 'Topping deleted successfully' });
});

// EXTRA TOPPINGS API ENDPOINTS
app.get('/api/extra-toppings', (req, res) => {
  const extraToppings = readDatabase(extraToppingsPath);
  res.json(extraToppings);
});

app.put('/api/extra-toppings', (req, res) => {
  const { extraCheese, extraMeat, extraVeg } = req.body;
  
  const extraToppings = readDatabase(extraToppingsPath);
  
  if (extraCheese) {
    extraToppings.extraCheese = { ...extraToppings.extraCheese, ...extraCheese };
  }
  if (extraMeat) {
    extraToppings.extraMeat = { ...extraToppings.extraMeat, ...extraMeat };
  }
  if (extraVeg) {
    extraToppings.extraVeg = { ...extraToppings.extraVeg, ...extraVeg };
  }
  
  writeDatabase(extraToppingsPath, extraToppings);
  res.json(extraToppings);
});

// ORDERS STATUS API ENDPOINTS
app.get('/api/orders-status', (req, res) => {
  const ordersStatus = readDatabase(ordersStatusPath);
  res.json(ordersStatus);
});

app.post('/api/orders-status/toggle', (req, res) => {
  const ordersStatus = readDatabase(ordersStatusPath);
  const { message } = req.body;
  
  ordersStatus.isOpen = !ordersStatus.isOpen;
  ordersStatus.message = message || ordersStatus.message;
  ordersStatus.lastUpdated = new Date().toISOString();
  
  writeDatabase(ordersStatusPath, ordersStatus);
  res.json(ordersStatus);
});

app.put('/api/orders-status', (req, res) => {
  const ordersStatus = readDatabase(ordersStatusPath);
  const { isOpen, message } = req.body;
  
  ordersStatus.isOpen = isOpen !== undefined ? isOpen : ordersStatus.isOpen;
  ordersStatus.message = message || ordersStatus.message;
  ordersStatus.lastUpdated = new Date().toISOString();
  
  writeDatabase(ordersStatusPath, ordersStatus);
  res.json(ordersStatus);
});

// Initialize database
initializeDatabase();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 