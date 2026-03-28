import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import LoginModal from './components/LoginModal'
import SignupModal from './components/SignupModal'
import Loader from './components/Loader'
import Home from './pages/Home'
import Crops from './pages/Crops'
import Fertilizer from './pages/Fertilizer'
import Disease from './pages/DiseaseDetection'
import Products from './pages/Products'
import Orders from './pages/Orders'
import OrderTracking from './pages/OrderTracking'  // Add this import
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import DoctorLogin from './pages/DoctorLogin'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorProfile from './components/DoctorProfile'
import UserDashboard from './pages/UserDashboard'
import './styles/global.css'

const AppContent = () => {
  const { user, loading, authChecked, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Debug log to check user role
  useEffect(() => {
    if (user) {
      console.log('=== APP CONTENT ===')
      console.log('Current user:', user)
      console.log('User role:', user.role)
      console.log('Is admin:', user.role === 'admin')
      console.log('Current path:', location.pathname)
    }
  }, [user, location])

  // Handle URL params for login/signup
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    if (queryParams.get('login') === 'true' && !user && !showLogin) {
      setShowLogin(true)
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
    if (queryParams.get('signup') === 'true' && !user && !showSignup) {
      setShowSignup(true)
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [location.search, user, showLogin, showSignup])

  // Handle direct navigation to /login and /signup
  useEffect(() => {
    if (location.pathname === '/login' && !user && !showLogin) {
      setShowLogin(true)
      navigate('/', { replace: true })
    } else if (location.pathname === '/signup' && !user && !showSignup) {
      setShowSignup(true)
      navigate('/', { replace: true })
    } else if ((location.pathname === '/login' || location.pathname === '/signup') && user) {
      navigate('/', { replace: true })
    }
  }, [location.pathname, user, showLogin, showSignup, navigate])

  // Protected route wrapper
  const ProtectedRoute = ({ children, requireAdmin = false }) => {
    if (!authChecked || loading) {
      return <Loader fullScreen />
    }
    
    if (!user) {
      console.log('No user, showing login modal')
      setShowLogin(true)
      return null
    }
    
    if (requireAdmin && user.role !== 'admin') {
      console.log('Admin access denied - user role:', user.role)
      toast.error('Admin access required')
      navigate('/', { replace: true })
      return null
    }
    
    return children
  }

  // Public route wrapper (for order tracking - accessible without login)
  const PublicRoute = ({ children }) => {
    if (!authChecked || loading) {
      return <Loader fullScreen />
    }
    return children
  }

  // Show loader while checking authentication
  if (!authChecked || loading) {
    return <Loader fullScreen />
  }

  return (
    <div className="app">
      <Navbar onMenuClick={() => setSidebarOpen(true)} onLoginClick={() => setShowLogin(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crops" element={<Crops />} />
        <Route path="/fertilizer" element={<Fertilizer />} />
        <Route path="/disease" element={<Disease />} />
        <Route path="/products" element={<Products />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
<Route path="/doctor/dashboard" element={<DoctorDashboard />} />
<Route path="/doctor/profile" element={<DoctorProfile />} />
<Route path="/dashboard" element={<UserDashboard />} />
        
        {/* Order Tracking - Public route accessible without login */}
        <Route path="/orders/:orderId" element={
          <PublicRoute>
            <OrderTracking />
          </PublicRoute>
        } />
        
        {/* Orders list - Protected route (requires login) */}
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {showLogin && !user && (
        <LoginModal 
          onClose={() => setShowLogin(false)} 
          onSwitch={() => {
            setShowLogin(false)
            setShowSignup(true)
          }}
        />
      )}
      
      {showSignup && !user && (
        <SignupModal 
          onClose={() => setShowSignup(false)} 
          onSwitch={() => {
            setShowSignup(false)
            setShowLogin(true)
          }}
        />
      )}
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: 'white',
            },
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App