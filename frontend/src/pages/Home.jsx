import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaLeaf, FaFlask, FaSearch, FaShoppingCart, FaUsers, FaTruck, FaStar, FaArrowRight } from 'react-icons/fa'
import toast from 'react-hot-toast'
import '../styles/Home.css'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })

  const features = [
    { icon: <FaLeaf />, title: 'Crop Recommendations', desc: 'AI-powered crop suggestions based on soil and weather', action: '/crops' },
    { icon: <FaFlask />, title: 'Fertilizer Guide', desc: 'Personalized fertilizer recommendations', action: '/fertilizer' },
    { icon: <FaSearch />, title: 'Disease Detection', desc: 'Upload photo for instant disease diagnosis', action: '/disease' },
    { icon: <FaShoppingCart />, title: 'Shop Products', desc: 'Premium agricultural inputs delivered', action: '/products' }
  ]

  const stats = [
    { value: '50,000+', label: 'Farmers Served', icon: <FaUsers /> },
    { value: '98%', label: 'Satisfaction Rate', icon: <FaStar /> },
    { value: '24/7', label: 'Expert Support', icon: <FaTruck /> }
  ]

  const handleContact = (e) => {
    e.preventDefault()
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill all fields')
      return
    }
    toast.success('Message sent! We\'ll get back to you soon.')
    setContactForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">🌾 Intelligent Farming Solutions</div>
            <h1 className="hero-title">
              Grow Smarter with<br />
              <span className="hero-highlight">AI-Powered Agriculture</span>
            </h1>
            <p className="hero-description">
              Get personalized crop recommendations, fertilizer advice, and disease detection 
              using cutting-edge AI technology. Join 50,000+ farmers already growing smarter.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/crops')}>
                Get Started <FaArrowRight />
              </button>
              <button className="btn-secondary" onClick={() => navigate('/products')}>
                Shop Products
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-emoji">🌿</div>
            <div className="floating-elements">
              <span className="float-1">🌾</span>
              <span className="float-2">🌱</span>
              <span className="float-3">🍅</span>
              <span className="float-4">🌽</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div className="stat-card" key={idx}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">What We Offer</span>
            <h2 className="section-title">Everything You Need for<br />Modern Farming</h2>
            <p className="section-description">AI-powered tools, expert knowledge, and premium inputs — all in one place</p>
          </div>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div className="feature-card" key={idx} onClick={() => navigate(feature.action)}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.desc}</p>
                <button className="feature-link">Learn More →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Farming?</h2>
            <p>Join thousands of farmers using Harvestify to increase yields and reduce costs</p>
            <button className="btn-primary" onClick={() => navigate('/crops')}>
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <span className="section-badge">Get in Touch</span>
              <h2>Have Questions?<br />We're Here to Help</h2>
              <p>Our team of agronomists is ready to assist you with any questions about our services</p>
              <div className="contact-details">
                <div className="contact-item">
                  <span>📞</span>
                  <div>
                    <strong>Phone</strong>
                    <p>+91 98765 43210</p>
                  </div>
                </div>
                <div className="contact-item">
                  <span>✉️</span>
                  <div>
                    <strong>Email</strong>
                    <p>support@harvestify.in</p>
                  </div>
                </div>
                <div className="contact-item">
                  <span>📍</span>
                  <div>
                    <strong>Office</strong>
                    <p>Agri Hub, New Delhi - 110001</p>
                  </div>
                </div>
              </div>
            </div>
            <form className="contact-form" onSubmit={handleContact}>
              <input
                type="text"
                placeholder="Your Name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Your Email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
              <textarea
                rows="4"
                placeholder="Your Message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              />
              <button type="submit" className="btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
