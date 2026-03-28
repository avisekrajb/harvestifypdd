import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getProducts } from '../services/api'
import ProductCard from '../components/ProductCard'
import ProductDetailModal from '../components/ProductDetailModal'
import CartDrawer from '../components/CartDrawer'
import CheckoutModal from '../components/CheckoutModal'
import { FaSearch, FaFilter } from 'react-icons/fa'
import toast from 'react-hot-toast'
import '../styles/Products.css'

const Products = () => {
  const { user } = useAuth()
  const { cart, addToCart, setCartOpen, cartOpen } = useCart()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory, products])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data.products || [])
      setFilteredProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredProducts(filtered)
  }

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'fertilizer', label: 'Fertilizers' },
    { id: 'pesticide', label: 'Pesticides' },
    { id: 'tool', label: 'Tools' }
  ]

  const handleBuyNow = (product) => {
    if (!user) {
      toast.error('Please login to continue')
      return
    }
    addToCart(product, 1)
    setCheckoutOpen(true)
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1 className="products-title">Premium Agricultural Products</h1>
          <p className="products-subtitle">Certified fertilizers, pesticides, and tools for modern farming</p>
        </div>

        <div className="products-controls">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="category-filters">
            <FaFilter className="filter-icon" />
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart(product)}
                  onBuyNow={() => handleBuyNow(product)}
                  onViewDetails={() => setSelectedProduct(product)}
                />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="empty-products">
                <div className="empty-icon">📦</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </>
        )}
      </div>

      {cartOpen && (
        <CartDrawer 
          cart={cart} 
          onClose={() => setCartOpen(false)} 
          onCheckout={() => {
            setCartOpen(false)
            setCheckoutOpen(true)
          }}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          user={user}
          onClose={() => setCheckoutOpen(false)}
          onPlaceOrder={() => {
            setCheckoutOpen(false)
            toast.success('Order placed successfully!')
          }}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={() => addToCart(selectedProduct)}
          onBuyNow={() => {
            addToCart(selectedProduct)
            setSelectedProduct(null)
            setCheckoutOpen(true)
          }}
        />
      )}
    </div>
  )
}

export default Products