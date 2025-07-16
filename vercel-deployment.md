# Vercel Deployment Guide for Pizza Restaurant Website

## 🚀 Fixed Issues

✅ **Mobile Display Problem**: Fixed CSS grid layout for featured items on mobile devices  
✅ **API Endpoint Issues**: Updated all hardcoded localhost URLs to use environment variables  
✅ **Responsive Design**: Added proper breakpoints for all screen sizes (320px+)  

## 📋 Deployment Steps

### 1. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `https://github.com/tanmaypatel558/Pizza-shop`
4. Configure build settings:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2. Environment Variables Setup
In your Vercel project settings, add these environment variables:

```
REACT_APP_API_URL=https://your-backend-url.com
```

**Note**: Replace `https://your-backend-url.com` with your actual backend server URL.

### 3. Backend Deployment Options

#### Option A: Deploy Backend to Vercel (Recommended)
1. Create a new Vercel project for your backend
2. Deploy the `backend` folder as a separate project
3. Use the Vercel URL as your `REACT_APP_API_URL`

#### Option B: Use Railway, Render, or Heroku
1. Deploy your backend to any cloud platform
2. Use that URL as your `REACT_APP_API_URL`

#### Option C: Keep Local Backend (Development Only)
If you're still developing, you can keep:
```
REACT_APP_API_URL=http://localhost:5000
```

### 4. Files Updated for Production
- `src/App.js` - Main app API calls
- `src/components/FeaturedItems.js` - Featured items display & API
- `src/components/CartSidebar.js` - Order placement API
- `src/components/OrderTracking.js` - Order tracking API
- `src/components/PizzaModal.js` - Pizza details API
- `src/components/FeaturedItems.css` - Mobile responsive fixes

### 5. Mobile Fixes Applied
- Grid layout now works on screens as small as 320px
- Proper responsive breakpoints for all devices
- Improved touch targets and button sizes
- Fixed item spacing and overflow issues

## 🔧 Local Development
To run locally after these changes:

1. **Start Backend**:
   ```bash
   cd backend
   node server.js
   ```

2. **Start Frontend**:
   ```bash
   npm start
   ```

3. **Environment Variables** (optional):
   Create `.env` file in root:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

## 📱 Testing Mobile
1. Deploy to Vercel
2. Open the Vercel URL on your mobile device
3. Check that featured items now display properly
4. Test all functionality on different screen sizes

## 🎯 Next Steps
1. Deploy your backend to a cloud service
2. Update `REACT_APP_API_URL` in Vercel settings
3. Test all features on mobile and desktop
4. Your pizza website will be fully functional!

---

**Repository**: https://github.com/tanmaypatel558/Pizza-shop  
**Latest Commit**: Mobile fixes and production API endpoints 