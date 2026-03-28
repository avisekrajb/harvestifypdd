import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaLeaf, FaFlask, FaSearch, FaShoppingCart, FaUsers, FaTruck, FaStar, FaArrowRight, FaSeedling, FaBug, FaChartLine, FaCloudSun, FaTractor, FaHandHoldingHeart } from 'react-icons/fa'
import toast from 'react-hot-toast'
import '../styles/Home.css'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroSlides = [
    {
      title: "Intelligent Farming,\nTimeless Harvest",
      subtitle: "AI-powered diagnostics meet premium agri science.",
      cta: "Get Started",
      action: "/crops",
      emoji: "🌾",
      bgGradient: "linear-gradient(135deg, #0a2a1a, #0d3a1a, #0a2a1a)"
    },
    {
      title: "Diagnose.\nTreat. Thrive.",
      subtitle: "Upload a crop photo. Get instant AI disease diagnosis.",
      cta: "Try Disease AI",
      action: "/disease",
      emoji: "🔬",
      bgGradient: "linear-gradient(135deg, #1a2a0a, #1a3a0a, #1a2a0a)"
    },
    {
      title: "Premium Products.\nDoorstep Delivery.",
      subtitle: "Certified fertilizers and tools for modern farming.",
      cta: "Shop Now",
      action: "/products",
      emoji: "🚚",
      bgGradient: "linear-gradient(135deg, #1a0a2a, #1a0a3a, #1a0a2a)"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    { icon: <FaLeaf />, title: 'Crop Recommendations', desc: 'AI-powered crop suggestions based on soil and weather', action: '/crops', color: '#4ade80' },
    { icon: <FaFlask />, title: 'Fertilizer Guide', desc: 'Personalized fertilizer recommendations', action: '/fertilizer', color: '#60a5fa' },
    { icon: <FaBug />, title: 'Disease Detection', desc: 'Upload photo for instant disease diagnosis', action: '/disease', color: '#f87171' },
    { icon: <FaShoppingCart />, title: 'Shop Products', desc: 'Premium agricultural inputs delivered', action: '/products', color: '#fbbf24' }
  ]

  const stats = [
    { value: '50,000+', label: 'Farmers Served', icon: <FaUsers />, trend: '+25%' },
    { value: '98%', label: 'Satisfaction Rate', icon: <FaStar />, trend: '+5%' },
    { value: '24/7', label: 'Expert Support', icon: <FaTruck />, trend: 'Always' },
    { value: '500+', label: 'Products', icon: <FaShoppingCart />, trend: '+50' }
  ]

  const testimonials = [
    { name: 'Ramesh Kumar', role: 'Rice Farmer', text: 'Harvestify helped me increase my yield by 40% with their AI recommendations!', rating: 5, avatar: '👨‍🌾' },
    { name: 'Priya Sharma', role: 'Organic Farmer', text: 'The disease detection feature saved my entire tomato crop. Highly recommend!', rating: 5, avatar: '👩‍🌾' },
    { name: 'Suresh Patel', role: 'Commercial Farmer', text: 'Best platform for modern farming. The products are top quality.', rating: 4, avatar: '👨‍🌾' }
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
      {/* Hero Carousel */}
      <section className="hero-section">
        <div className="hero-carousel">
          {heroSlides.map((slide, index) => (
            <div 
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ background: slide.bgGradient }}
            >
              <div className="hero-overlay"></div>
              <div className="hero-container">
                <div className="hero-content">
                  <div className="hero-badge">✨ AI-Powered Agriculture</div>
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-subtitle">{slide.subtitle}</p>
                  <button className="hero-cta" onClick={() => navigate(slide.action)}>
                    {slide.cta} <FaArrowRight />
                  </button>
                </div>
                <div className="hero-visual">
                  <div className="floating-emoji">{slide.emoji}</div>
                  <div className="floating-elements">
                    <span className="float-1">🌱</span>
                    <span className="float-2">🌾</span>
                    <span className="float-3">🍅</span>
                    <span className="float-4">🌽</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="hero-dots">
            {heroSlides.map((_, index) => (
              <button 
                key={index}
                className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
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
                <div className="stat-trend">{stat.trend}</div>
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
                <div className="feature-icon" style={{ background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}08)` }}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.desc}</p>
                <button className="feature-link">Learn More →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2 className="section-title">How Harvestify Works</h2>
            <p className="section-description">Get started in minutes with our easy-to-use platform</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon"><FaSeedling /></div>
              <h3>Upload Your Data</h3>
              <p>Share your soil parameters, crop type, and location</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon"><FaChartLine /></div>
              <h3>AI Analysis</h3>
              <p>Our AI analyzes your data using advanced algorithms</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon"><FaCloudSun /></div>
              <h3>Get Recommendations</h3>
              <p>Receive personalized crop and fertilizer advice</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon"><FaTractor /></div>
              <h3>Order Products</h3>
              <p>Shop recommended products delivered to your door</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Testimonials</span>
            <h2 className="section-title">What Farmers Say</h2>
            <p className="section-description">Trusted by thousands of farmers across India</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, idx) => (
              <div className="testimonial-card" key={idx}>
                <div className="testimonial-avatar">{testimonial.avatar}</div>
                <div className="testimonial-rating">
                  {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <h4 className="testimonial-name">{testimonial.name}</h4>
                <p className="testimonial-role">{testimonial.role}</p>
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
              Start Free Trial <FaArrowRight />
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
              <button type="submit" className="btn-primary">Send Message <FaArrowRight /></button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
