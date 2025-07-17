# Admin Dashboard Guide 🛠️

## 🚀 Accessing the Admin Dashboard

### URL Access
- **Local Development**: `http://localhost:3000/admin`
- **Production (Vercel)**: `https://your-vercel-url.vercel.app/admin`

### Quick Access Steps
1. Open your pizza website
2. Add `/admin` to the end of the URL
3. Press Enter to access the admin dashboard

## 🎛️ Dashboard Features

### 📊 Statistics Overview
- **Total Orders**: Complete order count
- **Pending Orders**: Orders waiting to be processed
- **In Oven**: Orders currently being prepared
- **Out for Delivery**: Orders on the way to customers

### 🔧 Management Tabs

#### 📋 Orders Management
- View all customer orders
- Update order status (Received → In Preparation → In Oven → Ready → Out for Delivery → Delivered)
- Filter orders by status
- Real-time notifications for new orders

#### ⭐ Featured Items Management
- Add/Edit/Delete featured pizza items
- Toggle item availability
- Update pricing and descriptions
- Manage item images and ratings

#### 🍕 Pizza Menu Management
- Full menu management
- Add new pizza varieties
- Edit existing pizzas
- Set availability status
- Manage ingredients and descriptions

#### 🥓 Toppings Management
- Add/Edit/Delete toppings
- Set pricing for different quantities (Normal, Extra, Double)
- Toggle topping availability
- Manage topping categories

#### 🧀 Extra Toppings Management
- Manage special extra toppings
- Set pricing for premium add-ons
- Toggle availability

#### 🚫 Orders Status Toggle
- Enable/Disable online ordering
- Set custom closure messages
- Emergency stop for orders during rush periods

## 🔧 Demo Mode vs Full Mode

### Demo Mode (No Backend)
- **Indicator**: Yellow "Demo Mode" badge
- **Functionality**: Limited - View interface only
- **Data**: No real order data
- **Status**: Backend not connected

### Full Mode (With Backend)
- **Indicator**: No demo badge
- **Functionality**: Complete admin features
- **Data**: Real order management
- **Status**: Backend connected and operational

## 🔄 Real-time Features

### Live Updates
- New orders appear instantly
- Order status changes in real-time
- Customer notifications sent automatically
- Admin notifications for important events

### Socket Connection
- Automatic reconnection on connection loss
- Real-time order tracking
- Live dashboard updates

## 🛠️ Troubleshooting

### Common Issues

#### Dashboard Shows "Demo Mode"
- **Problem**: Backend not connected
- **Solution**: Deploy backend or set `REACT_APP_API_URL`

#### Orders Not Loading
- **Problem**: API connection failed
- **Solution**: Check backend deployment status

#### Real-time Updates Not Working
- **Problem**: Socket connection failed
- **Solution**: Verify backend WebSocket support

#### Can't Update Orders
- **Problem**: Backend API not responding
- **Solution**: Check backend server status

### Error Messages
- **"Real-time updates unavailable"**: Socket connection failed
- **"Error loading orders"**: API connection problem
- **"Error updating order status"**: Backend processing issue

## 🚀 Backend Deployment Required

### For Full Functionality
1. **Deploy Backend**: Use Vercel, Railway, or Render
2. **Set Environment Variable**: `REACT_APP_API_URL`
3. **Update Frontend**: Redeploy with new API URL

### Backend Deployment Steps
```bash
# Deploy backend
cd backend
npx vercel --prod

# Get backend URL
# Example: https://pizza-backend-xyz.vercel.app

# Update frontend environment
# In Vercel Dashboard → Settings → Environment Variables
# Add: REACT_APP_API_URL = https://pizza-backend-xyz.vercel.app
```

## 📱 Mobile Admin Access

### Responsive Design
- Dashboard works on tablets and mobile devices
- Touch-friendly interface
- Optimized for small screens

### Mobile Features
- All desktop functionality available
- Swipe gestures for navigation
- Mobile-optimized forms

## 🔐 Security Notes

### Admin Access
- No authentication required (add if needed)
- Direct URL access to admin panel
- Consider adding password protection for production

### Data Protection
- All data stored in JSON files
- No sensitive information exposed
- Backend handles all data processing

## 📊 Performance Tips

### Best Practices
- Keep browser tab open for real-time updates
- Refresh page if updates stop working
- Use desktop for heavy admin tasks

### Optimization
- Dashboard loads quickly in demo mode
- Real-time updates minimize page refreshes
- Efficient data handling for large order volumes

---

**Your admin dashboard is now fully functional! 🎉**

Access it at: `https://your-vercel-url.vercel.app/admin` 