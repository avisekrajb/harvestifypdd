import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  getAdminStats, 
  getAllOrders, 
  getAllUsers, 
  getProducts, 
  updateOrderStatus, 
  deleteProduct, 
  createProduct,
  getDoctors,
  createDoctor,
  deleteDoctor,
  getMessages,
  markMessageRead,
  uploadProductPhoto
} from '../services/api'
import api from '../services/api'
import { 
  FaUsers, FaShoppingBag, FaProductHunt, FaMoneyBillWave, 
  FaClock, FaChartLine, FaBox, FaUser, FaTrash, FaPlus, 
  FaTimes, FaCheck, FaEnvelope, FaPhone, FaCalendar, 
  FaStethoscope, FaImage, FaUpload, FaEye, FaBug
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'
import '../styles/Admin.css'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

const Admin = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [doctors, setDoctors] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddDoctor, setShowAddDoctor] = useState(false)
  const [showOrderDetail, setShowOrderDetail] = useState(null)
  
  // Disease history states
  const [diseaseHistory, setDiseaseHistory] = useState([])
  const [diseaseHistoryLoading, setDiseaseHistoryLoading] = useState(false)
  const [diseaseStats, setDiseaseStats] = useState({})
  const [selectedDiseaseDetail, setSelectedDiseaseDetail] = useState(null)
  const [showDiseaseModal, setShowDiseaseModal] = useState(false)
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    original_price: '',
    category: 'fertilizer',
    description: '',
    image: '🌱',
    stock: '',
    tags: []
  })
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    speciality: '',
    phone: '',
    email: ''
  })
  const [productPhoto, setProductPhoto] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef()

  // Analytics data
  const [orderStats, setOrderStats] = useState({
    monthlyOrders: [],
    categoryDistribution: [],
    dailyRevenue: []
  })

  // Helper function to get image URL
  const getImageUrl = (photo) => {
    if (!photo) return null
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo
    if (photo.startsWith('/uploads')) return `http://localhost:5000${photo}`
    return `http://localhost:5000/${photo}`
  }

  // Helper function for confidence class
  const getConfidenceClass = (confidence) => {
    if (confidence >= 70) return 'confidence-high'
    if (confidence >= 40) return 'confidence-medium'
    return 'confidence-low'
  }

  // Helper function for plant icon
  const getPlantIcon = (disease) => {
    const lowerDisease = disease?.toLowerCase() || ''
    if (lowerDisease.includes('corn')) return '🌽'
    if (lowerDisease.includes('potato')) return '🥔'
    if (lowerDisease.includes('tomato')) return '🍅'
    if (lowerDisease.includes('rice')) return '🌾'
    if (lowerDisease.includes('wheat')) return '🌾'
    return '🌱'
  }

  useEffect(() => {
    const navbar = document.querySelector('.navbar')
    if (navbar) {
      navbar.style.display = 'none'
    }
    return () => {
      const navbar = document.querySelector('.navbar')
      if (navbar) {
        navbar.style.display = 'flex'
      }
    }
  }, [])

  useEffect(() => {
    if (!user) {
      navigate('/?login=true')
      return
    }
    if (user.role !== 'admin') {
      toast.error('Admin access required')
      navigate('/')
      return
    }
    fetchDashboardData()
  }, [user, navigate, activeTab])

  useEffect(() => {
    if (orders.length > 0 || products.length > 0) {
      calculateAnalytics()
    }
  }, [orders, products])

  const calculateAnalytics = () => {
    const monthlyData = {}
    orders.forEach(order => {
      if (order.created_at) {
        const date = new Date(order.created_at)
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1
      }
    })
    const monthlyOrders = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count
    })).slice(-6)
    
    const categoryData = {}
    products.forEach(product => {
      categoryData[product.category] = (categoryData[product.category] || 0) + 1
    })
    const categoryDistribution = Object.entries(categoryData).map(([name, value]) => ({
      name: name || 'Other',
      value
    }))
    
    const revenueData = {}
    orders.forEach(order => {
      if (order.created_at && order.total) {
        const date = new Date(order.created_at).toLocaleDateString()
        revenueData[date] = (revenueData[date] || 0) + (order.total || 0)
      }
    })
    const dailyRevenue = Object.entries(revenueData).map(([date, amount]) => ({
      date,
      amount
    })).slice(-7)
    
    setOrderStats({ monthlyOrders, categoryDistribution, dailyRevenue })
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'dashboard') {
        const statsData = await getAdminStats()
        setStats(statsData)
        const ordersData = await getAllOrders()
        setOrders(ordersData.orders || [])
        const productsData = await getProducts()
        setProducts(productsData.products || [])
      } else if (activeTab === 'orders') {
        const ordersData = await getAllOrders()
        setOrders(ordersData.orders || [])
        const doctorsData = await getDoctors()
        setDoctors(doctorsData.doctors || [])
      } else if (activeTab === 'users') {
        const usersData = await getAllUsers()
        setUsers(usersData.users || [])
      } else if (activeTab === 'products') {
        const productsData = await getProducts()
        setProducts(productsData.products || [])
      } else if (activeTab === 'doctors') {
        const doctorsData = await getDoctors()
        setDoctors(doctorsData.doctors || [])
      } else if (activeTab === 'messages') {
        const messagesData = await getMessages()
        setMessages(messagesData.messages || [])
      } else if (activeTab === 'disease-history') {
        await fetchDiseaseHistory()
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        logout()
        navigate('/?login=true')
      } else {
        toast.error('Failed to load admin data')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchDiseaseHistory = async () => {
    setDiseaseHistoryLoading(true)
    try {
      const response = await api.get('/admin/disease-history')
      setDiseaseHistory(response.data.history || [])
      setDiseaseStats(response.data.stats || {})
    } catch (error) {
      console.error('Error fetching disease history:', error)
      toast.error('Failed to load disease history')
    } finally {
      setDiseaseHistoryLoading(false)
    }
  }

  const viewDiseaseDetail = async (id) => {
    try {
      const response = await api.get(`/admin/disease-history/${id}`)
      setSelectedDiseaseDetail(response.data)
      setShowDiseaseModal(true)
    } catch (error) {
      toast.error('Failed to load details')
    }
  }

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status)
      toast.success('Order status updated')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleAssignDoctor = async (orderId, doctorName) => {
    try {
      await updateOrderStatus(orderId, null, doctorName)
      toast.success(`Doctor assigned: ${doctorName || 'None'}`)
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to assign doctor')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId)
        toast.success('Product deleted successfully')
        fetchDashboardData()
      } catch (error) {
        toast.error('Failed to delete product')
      }
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    if (!doctorId) {
      toast.error('Doctor ID is missing')
      return
    }
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await deleteDoctor(doctorId)
        toast.success('Doctor deleted successfully')
        fetchDashboardData()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error(error.response?.data?.error || 'Failed to delete doctor')
      }
    }
  }

  const handleMarkMessageRead = async (messageId) => {
    try {
      await markMessageRead(messageId)
      toast.success('Message marked as read')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to mark message as read')
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    setUploadingPhoto(true)
    try {
      const result = await uploadProductPhoto(file)
      const normalizedUrl = getImageUrl(result.url)
      setProductPhoto(normalizedUrl)
      setNewProduct({ ...newProduct, photo: normalizedUrl })
      toast.success('Photo uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Please fill required fields')
      return
    }
    try {
      await createProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        original_price: parseFloat(newProduct.original_price) || parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock) || 100,
        rating: 4.5,
        reviews: 0,
        photo: productPhoto
      })
      toast.success('Product added successfully')
      setShowAddProduct(false)
      setNewProduct({
        name: '',
        price: '',
        original_price: '',
        category: 'fertilizer',
        description: '',
        image: '🌱',
        stock: '',
        tags: []
      })
      setProductPhoto(null)
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to add product')
    }
  }

  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.speciality) {
      toast.error('Please fill required fields')
      return
    }
    try {
      await createDoctor(newDoctor)
      toast.success('Doctor added successfully')
      setShowAddDoctor(false)
      setNewDoctor({
        name: '',
        speciality: '',
        phone: '',
        email: ''
      })
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to add doctor')
    }
  }

  const getStatusBadge = (status) => {
    const statusClass = {
      pending: 'pending',
      processing: 'processing',
      delivered: 'delivered',
      cancelled: 'cancelled'
    }[status] || 'pending'
    return <span className={`status-badge ${statusClass}`}>{status}</span>
  }

  const monthlyOrdersChartData = {
    labels: orderStats.monthlyOrders.map(item => item.month),
    datasets: [{
      label: 'Orders',
      data: orderStats.monthlyOrders.map(item => item.count),
      backgroundColor: 'rgba(74, 222, 128, 0.5)',
      borderColor: 'rgb(74, 222, 128)',
      borderWidth: 2,
      borderRadius: 8,
    }]
  }

  const categoryDistributionData = {
    labels: orderStats.categoryDistribution.map(item => item.name),
    datasets: [{
      label: 'Products',
      data: orderStats.categoryDistribution.map(item => item.value),
      backgroundColor: ['rgba(74, 222, 128, 0.8)', 'rgba(96, 165, 250, 0.8)', 'rgba(251, 191, 36, 0.8)', 'rgba(168, 85, 247, 0.8)'],
      borderWidth: 0,
    }]
  }

  const revenueChartData = {
    labels: orderStats.dailyRevenue.map(item => item.date),
    datasets: [{
      label: 'Revenue (₹)',
      data: orderStats.dailyRevenue.map(item => item.amount),
      fill: true,
      backgroundColor: 'rgba(74, 222, 128, 0.1)',
      borderColor: 'rgb(74, 222, 128)',
      tension: 0.4,
      pointBackgroundColor: 'rgb(74, 222, 128)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: 'var(--text)', font: { size: 12 } } },
      tooltip: { backgroundColor: 'var(--surface)', titleColor: 'var(--text)', bodyColor: 'var(--text2)', borderColor: 'var(--border)', borderWidth: 1 }
    },
    scales: {
      y: { grid: { color: 'var(--border)' }, ticks: { color: 'var(--muted)' } },
      x: { grid: { display: false }, ticks: { color: 'var(--muted)' } }
    }
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="admin-logo">
            <div className="logo-icon">🌿</div>
            <span>Harvestify Admin</span>
          </div>
          <nav className="admin-nav">
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><FaChartLine /> Dashboard</button>
            <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><FaShoppingBag /> Orders</button>
            <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><FaUsers /> Users</button>
            <button className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}><FaBox /> Products</button>
            <button className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}><FaStethoscope /> Doctors</button>
            <button className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}><FaEnvelope /> Messages</button>
            <button className={`nav-item ${activeTab === 'disease-history' ? 'active' : ''}`} onClick={() => setActiveTab('disease-history')}><FaBug /> Disease History</button>
          </nav>
          <div className="admin-footer">
            <div className="admin-user">
              <div className="admin-user-icon"><FaUser /></div>
              <div><div className="admin-user-name">{user?.name}</div><div className="admin-user-email">{user?.email}</div></div>
            </div>
            <button className="logout-btn" onClick={logout}>Sign Out</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-content">
          <div className="admin-header"><h1>Welcome back, {user?.name}</h1><p>Manage your platform from here</p></div>

          {loading ? (
            <div className="loading-container"><div className="loading-spinner"></div><p>Loading dashboard...</p></div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && stats && (
                <>
                  <div className="dashboard-stats">
                    <div className="stat-card"><div className="stat-icon"><FaShoppingBag /></div><div className="stat-info"><h3>{stats.total_orders || 0}</h3><p>Total Orders</p></div></div>
                    <div className="stat-card"><div className="stat-icon"><FaUsers /></div><div className="stat-info"><h3>{stats.total_users || 0}</h3><p>Total Users</p></div></div>
                    <div className="stat-card"><div className="stat-icon"><FaProductHunt /></div><div className="stat-info"><h3>{stats.total_products || 0}</h3><p>Products</p></div></div>
                    <div className="stat-card"><div className="stat-icon"><FaMoneyBillWave /></div><div className="stat-info"><h3>₹{(stats.total_revenue || 0).toLocaleString()}</h3><p>Revenue</p></div></div>
                    <div className="stat-card"><div className="stat-icon"><FaClock /></div><div className="stat-info"><h3>{stats.pending_orders || 0}</h3><p>Pending Orders</p></div></div>
                  </div>

                  {(orderStats.monthlyOrders.length > 0 || orderStats.categoryDistribution.length > 0 || orderStats.dailyRevenue.length > 0) && (
                    <div className="analytics-section">
                      <div className="analytics-header"><h3><FaChartLine /> Analytics Overview</h3><p>Platform performance metrics</p></div>
                      <div className="charts-grid">
                        {orderStats.monthlyOrders.length > 0 && <div className="chart-card"><div className="chart-title"><FaChartLine /> Monthly Orders</div><div className="chart-container"><Bar data={monthlyOrdersChartData} options={chartOptions} /></div></div>}
                        {orderStats.categoryDistribution.length > 0 && <div className="chart-card"><div className="chart-title"><FaChartLine /> Product Distribution</div><div className="chart-container"><Pie data={categoryDistributionData} options={chartOptions} /></div></div>}
                        {orderStats.dailyRevenue.length > 0 && <div className="chart-card full-width"><div className="chart-title"><FaChartLine /> Revenue Trend</div><div className="chart-container large"><Line data={revenueChartData} options={chartOptions} /></div></div>}
                      </div>
                    </div>
                  )}

                  <div className="recent-orders">
                    <h3>Recent Orders</h3>
                    <div className="table-responsive">
                      <table className="admin-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Amount</th><th>Status</th></tr></thead><tbody>
                        {orders.slice(0, 5).map(order => (<tr key={order._id || order.id} onClick={() => setShowOrderDetail(order)} style={{ cursor: 'pointer' }}><td>#{order.order_id}</td><td>{order.name}</td><td>{order.phone || '—'}</td><td>₹{(order.total || 0).toLocaleString()}</td><td>{getStatusBadge(order.status)}</td><tr>))}
                        {orders.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No orders found</td></tr>}
                      </tbody></table>
                    </div>
                  </div>
                </>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="orders-table-container">
                  <h2>All Orders</h2>
                  <div className="table-responsive"><table className="admin-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Email</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Assign Doctor</th><th>Action</th></tr></thead><tbody>
                    {orders.length === 0 ? <tr><td colSpan="10" style={{ textAlign: 'center' }}>No orders found</td></tr> : orders.map(order => {
                      const orderId = order._id || order.id
                      return (<tr key={orderId}><td>#{order.order_id}</td><td>{order.name}</td><td><FaPhone /> {order.phone || '—'}</td><td>{order.email}</td><td>{order.items?.length || 0} items</td><td>₹{(order.total || 0).toLocaleString()}</td><td>{order.payment_method === 'cod' ? 'COD' : 'Online'}</td><td>{getStatusBadge(order.status)}</td>
                      <td><select value={order.assigned_doctor || ''} onChange={(e) => handleAssignDoctor(orderId, e.target.value)} className="doctor-select"><option value="">None</option>{doctors.map(doc => (<option key={doc._id || doc.id} value={doc.name}>{doc.name}</option>))}</select></td>
                      <td><select value={order.status} onChange={(e) => handleStatusUpdate(orderId, e.target.value)} className="status-select"><option value="pending">Pending</option><option value="processing">Processing</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></td></tr>)
                    })}
                  </tbody></table></div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="users-table-container">
                  <h2>All Users</h2>
                  <div className="table-responsive"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Role</th><th>Joined</th></tr></thead><tbody>
                    {users.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center' }}>No users found</td></tr> : users.map(user => (<tr key={user._id || user.id}><td><FaUser /> {user.name}</td><td>{user.email}</td><td>{user.phone || '—'}</td><td>{user.address || '—'}</td><td><span className={`role-badge ${user.role}`}>{user.role || 'user'}</span></td><td><FaCalendar /> {new Date(user.created_at).toLocaleDateString()}</td></tr>))}
                  </tbody></table></div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="products-container">
                  <div className="products-header"><h2>Products</h2><button className="add-product-btn" onClick={() => setShowAddProduct(true)}><FaPlus /> Add Product</button></div>
                  <div className="products-grid-admin">
                    {products.map(product => (<div key={product._id || product.id} className="product-card-admin"><div className="product-image">{product.photo ? <img src={getImageUrl(product.photo)} alt={product.name} /> : <div className="product-emoji">{product.image || '🌱'}</div>}</div>
                    <div className="product-info"><h4>{product.name}</h4><p className="product-price">₹{product.price}</p><p className="product-original">₹{product.original_price}</p><span className="stock-badge">Stock: {product.stock || 100}</span><div className="product-actions"><button className="delete-btn" onClick={() => handleDeleteProduct(product._id || product.id)}><FaTrash /> Delete</button></div></div></div>))}
                  </div>
                </div>
              )}

              {/* Doctors Tab */}
              {activeTab === 'doctors' && (
                <div className="doctors-container">
                  <div className="products-header"><h2>Agronomists & Doctors</h2><button className="add-product-btn" onClick={() => setShowAddDoctor(true)}><FaPlus /> Add Doctor</button></div>
                  <div className="doctors-grid">
                    {doctors && doctors.length > 0 ? doctors.map(doctor => (<div key={doctor._id || doctor.id} className="doctor-card"><div className="doctor-icon"><FaStethoscope /></div><div className="doctor-info"><h4>{doctor.name}</h4><p>{doctor.speciality}</p><div className="doctor-contact"><span><FaPhone /> {doctor.phone || '—'}</span><span><FaEnvelope /> {doctor.email || '—'}</span></div></div><button className="delete-doctor-btn" onClick={() => handleDeleteDoctor(doctor._id || doctor.id)}><FaTrash /></button></div>)) : <div className="empty-state"><p>No doctors added yet</p></div>}
                  </div>
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <div className="messages-container">
                  <h2>Contact Messages</h2>
                  <div className="messages-list">
                    {messages && messages.length > 0 ? messages.map(message => (<div key={message._id || message.id} className={`message-card ${!message.read ? 'unread' : ''}`}><div className="message-header"><div className="message-sender"><strong>{message.name}</strong><span>{message.email}</span></div><div className="message-date"><FaCalendar /> {new Date(message.created_at).toLocaleString()}</div></div><div className="message-body"><p>{message.message}</p></div>{!message.read && <button className="mark-read-btn" onClick={() => handleMarkMessageRead(message._id || message.id)}><FaCheck /> Mark as Read</button>}</div>)) : <div className="empty-state"><p>No messages yet</p></div>}
                  </div>
                </div>
              )}

              {/* Disease History Tab */}
              {activeTab === 'disease-history' && (
                <div className="disease-history-container">
                  <div className="products-header">
                    <h2>Disease Detection History</h2>
                    <div className="history-stats">
                      <span className="stat-badge">Total: {diseaseStats.total_detections || 0}</span>
                      <span className="stat-badge">Users: {diseaseStats.unique_users || 0}</span>
                    </div>
                  </div>
                  {diseaseHistoryLoading ? (
                    <div className="loading-container"><div className="loading-spinner"></div><p>Loading history...</p></div>
                  ) : diseaseHistory.length === 0 ? (
                    <div className="empty-state"><FaBug /><p>No disease detection history yet</p></div>
                  ) : (
                    <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr><th>Image</th><th>User</th><th>Disease</th><th>Plant</th><th>Confidence</th><th>Date</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                          {diseaseHistory.map(item => (
                            <tr key={item._id}>
                              <td>{item.image_url ? <img src={item.image_url} alt={item.filename} className="history-thumb" /> : <div className="no-image">No image</div>}</td>
                              <td><div className="user-info-cell"><strong>{item.user?.name || 'Unknown'}</strong><small>{item.user?.email || 'No email'}</small></div></td>
                              <td className="disease-cell">{item.disease}</td>
                              <td><span className="plant-badge-sm">{getPlantIcon(item.disease)} {item.plant_name}</span></td>
                              <td><span className={`confidence-badge ${getConfidenceClass(item.confidence)}`}>{item.confidence?.toFixed(1)}%</span></td>
                              <td><FaCalendar /> {new Date(item.created_at).toLocaleDateString()}</td>
                              <td><button className="view-btn" onClick={() => viewDiseaseDetail(item._id)}><FaEye /> View</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && (
        <div className="modal-overlay" onClick={() => setShowOrderDetail(null)}>
          <div className="order-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Order Details #{showOrderDetail.order_id}</h3><button className="close-modal" onClick={() => setShowOrderDetail(null)}><FaTimes /></button></div>
            <div className="modal-body">
              <div className="detail-section"><h4>Customer Information</h4><p><strong>Name:</strong> {showOrderDetail.name}</p><p><strong>Email:</strong> {showOrderDetail.email}</p><p><strong>Phone:</strong> {showOrderDetail.phone || '—'}</p><p><strong>Address:</strong> {showOrderDetail.address || '—'}</p></div>
              <div className="detail-section"><h4>Order Information</h4><p><strong>Order ID:</strong> #{showOrderDetail.order_id}</p><p><strong>Date:</strong> {new Date(showOrderDetail.created_at).toLocaleString()}</p><p><strong>Payment Method:</strong> {showOrderDetail.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p><p><strong>Status:</strong> {getStatusBadge(showOrderDetail.status)}</p></div>
              <div className="detail-section"><h4>Items</h4><table className="items-table"><thead><tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead><tbody>{showOrderDetail.items?.map((item, idx) => (<tr key={idx}><td>{item.name}</td><td>{item.quantity}</td><td>₹{item.price}</td><td>₹{item.price * item.quantity}</td></tr>))}</tbody></table></div>
              <div className="detail-total"><strong>Total Amount: ₹{(showOrderDetail.total || 0).toLocaleString()}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Disease Detail Modal */}
      {showDiseaseModal && selectedDiseaseDetail && (
        <div className="modal-overlay" onClick={() => setShowDiseaseModal(false)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDiseaseModal(false)}><FaTimes /></button>
            <div className="modal-header"><h3><FaBug /> Disease Analysis Details</h3><span className="user-badge">{selectedDiseaseDetail.user?.name}</span></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-image">
                  <img src={selectedDiseaseDetail.image_url} alt={selectedDiseaseDetail.filename} />
                  <p><FaImage /> {selectedDiseaseDetail.filename}</p>
                  <p><FaUser /> User: {selectedDiseaseDetail.user?.name}</p>
                  <p><FaEnvelope /> {selectedDiseaseDetail.user?.email}</p>
                  <p><FaCalendar /> {new Date(selectedDiseaseDetail.created_at).toLocaleString()}</p>
                </div>
                <div className="detail-info">
                  <div className="detail-item"><strong>Disease:</strong> <span>{selectedDiseaseDetail.disease}</span></div>
                  <div className="detail-item"><strong>Plant:</strong> <span>{getPlantIcon(selectedDiseaseDetail.disease)} {selectedDiseaseDetail.plant_name}</span></div>
                  <div className="detail-item"><strong>Confidence:</strong> <span className={`confidence-badge ${getConfidenceClass(selectedDiseaseDetail.confidence)}`}>{selectedDiseaseDetail.confidence?.toFixed(1)}%</span></div>
                </div>
              </div>
              {selectedDiseaseDetail.gemini_response && (
                <div className="detail-treatment">
                  <h4><FaFlask /> Treatment Recommendations</h4>
                  <div className="treatment-content" style={{ whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedDiseaseDetail.gemini_response}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
          <div className="product-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add New Product</h3><button className="close-modal" onClick={() => setShowAddProduct(false)}><FaTimes /></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Product Name *</label><input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="Enter product name" /></div>
              <div className="form-row"><div className="form-group"><label>Price (₹) *</label><input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} placeholder="Current price" /></div><div className="form-group"><label>Original Price (₹)</label><input type="number" value={newProduct.original_price} onChange={(e) => setNewProduct({...newProduct, original_price: e.target.value})} placeholder="Original price" /></div></div>
              <div className="form-row"><div className="form-group"><label>Category</label><select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}><option value="fertilizer">Fertilizer</option><option value="pesticide">Pesticide</option><option value="tool">Tool</option></select></div><div className="form-group"><label>Stock</label><input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} placeholder="Stock quantity" /></div></div>
              <div className="form-group"><label>Product Photo</label><div className="photo-upload-area" onClick={() => fileInputRef.current.click()}><input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />{uploadingPhoto ? <div className="uploading">Uploading...</div> : productPhoto ? <div className="photo-preview"><img src={productPhoto} alt="Preview" onError={(e) => { e.target.src = 'https://picsum.photos/400/400?random=1' }} /><FaImage /></div> : <div className="upload-placeholder"><FaUpload /><p>Click to upload product photo</p></div>}</div></div>
              <div className="form-group"><label>Description</label><textarea rows="3" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} placeholder="Product description" /></div>
              <div className="form-group"><label>Icon/Emoji</label><input type="text" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} placeholder="🌱" maxLength="2" /></div>
            </div>
            <div className="modal-footer"><button className="cancel-btn" onClick={() => setShowAddProduct(false)}>Cancel</button><button className="submit-btn" onClick={handleAddProduct}><FaCheck /> Add Product</button></div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="modal-overlay" onClick={() => setShowAddDoctor(false)}>
          <div className="product-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add New Doctor/Agronomist</h3><button className="close-modal" onClick={() => setShowAddDoctor(false)}><FaTimes /></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Full Name *</label><input type="text" value={newDoctor.name} onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})} placeholder="Dr. John Doe" /></div>
              <div className="form-group"><label>Speciality *</label><input type="text" value={newDoctor.speciality} onChange={(e) => setNewDoctor({...newDoctor, speciality: e.target.value})} placeholder="Crop Disease Specialist" /></div>
              <div className="form-row"><div className="form-group"><label>Phone</label><input type="tel" value={newDoctor.phone} onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})} placeholder="9876543210" /></div><div className="form-group"><label>Email</label><input type="email" value={newDoctor.email} onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})} placeholder="doctor@example.com" /></div></div>
            </div>
            <div className="modal-footer"><button className="cancel-btn" onClick={() => setShowAddDoctor(false)}>Cancel</button><button className="submit-btn" onClick={handleAddDoctor}><FaCheck /> Add Doctor</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
