import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { 
  FaLeaf, FaFlask, FaSearch, FaShoppingCart, FaUsers, 
  FaTruck, FaStar, FaArrowRight, FaSeedling, FaChartLine, 
  FaShieldAlt, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
  FaCheckCircle, FaPlay, FaQuoteLeft, FaAward, FaHandHoldingHeart,
  FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaSun, FaMoon
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import '../styles/Home.css'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })

  const features = [
    { icon: <FaLeaf />, title: 'Crop Recommendations', desc: 'AI-powered crop suggestions based on soil and weather conditions', action: '/crops', color: '#10b981' },
    { icon: <FaFlask />, title: 'Fertilizer Guide', desc: 'Personalized fertilizer recommendations for optimal yield', action: '/fertilizer', color: '#f59e0b' },
    { icon: <FaSearch />, title: 'Disease Detection', desc: 'Upload photo for instant AI-powered disease diagnosis', action: '/disease', color: '#ef4444' },
    { icon: <FaShoppingCart />, title: 'Shop Products', desc: 'Premium agricultural inputs delivered to your doorstep', action: '/products', color: '#3b82f6' }
  ]

  const testimonials = [
    { name: 'Ramesh Kumar', role: 'Rice Farmer', content: 'Harvestify helped me increase my yield by 40% with their AI recommendations!', rating: 5, avatar: '👨‍🌾' },
    { name: 'Priya Sharma', role: 'Organic Farmer', content: 'The disease detection feature saved my entire tomato crop. Highly recommend!', rating: 5, avatar: '👩‍🌾' },
    { name: 'Suresh Patel', role: 'Commercial Farmer', content: 'Best platform for modern farming. The products are top quality.', rating: 5, avatar: '👨‍🌾' }
  ]

  const teamMembers = [
    { name: 'Abhishek Rajbanshi', role: 'Founder & CEO', bio: 'Full-stack developer with passion for AgriTech', avatar: '👨‍💻', icon: '👨', social: { linkedin: '#', twitter: '#', github: '#' } },
    { name: 'Balu Pinisetti', role: 'Lead Agronomist', bio: 'Expert in crop disease management', avatar: '👨‍🌾', icon: '👨', social: { linkedin: '#', twitter: '#', github: '#' } },
    { name: 'Jyoti Kumari', role: 'AI Research Scientist', bio: 'Specialist in machine learning models', avatar: '👩‍🔬', icon: '👩', social: { linkedin: '#', twitter: '#', github: '#' } },
    { name: 'Swami Nathan', role: 'Product Manager', bio: 'Agri-business expert with 10+ years experience', avatar: '👨‍💼', icon: '👨', social: { linkedin: '#', twitter: '#', github: '#' } }
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
    <div className={`home-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Theme Toggle Button */}
      <button className="theme-toggle-fab" onClick={toggleDarkMode}>
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-pattern"></div>
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge-icon">✨</span>
                AI-Powered Agriculture Platform
              </div>
              <h1 className="hero-title">
                Grow Smarter with<br />
                <span className="hero-gradient">Intelligent Farming</span>
              </h1>
              <p className="hero-description">
                Get personalized crop recommendations, fertilizer advice, and disease detection 
                using cutting-edge AI technology. Join 50,000+ farmers already growing smarter.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={() => navigate('/crops')}>
                  Get Started <FaArrowRight />
                </button>
                <button className="btn-outline" onClick={() => navigate('/products')}>
                  Shop Products
                </button>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Active Farmers</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">98%</span>
                  <span className="stat-label">Satisfaction Rate</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Expert Support</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-card-3d">
                <div className="hero-emoji">🌾</div>
                <div className="floating-icons">
                  <span className="float-icon">🌱</span>
                  <span className="float-icon">🍅</span>
                  <span className="float-icon">🌽</span>
                  <span className="float-icon">🥬</span>
                  <span className="float-icon">🍆</span>
                </div>
                <div className="hero-stats-card">
                  <div className="stat-row">
                    <FaChartLine />
                    <span>Yield +35%</span>
                  </div>
                  <div className="stat-row">
                    <FaShieldAlt />
                    <span>Crop Health</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-section">
        <div className="container">
          <p className="trust-label">Trusted By Leading Agricultural Organizations</p>
          <div className="trust-badges">
            <span>🏆 Best AgriTech 2024</span>
            <span>⭐ 4.9 Rating</span>
            <span>🌱 50K+ Farmers</span>
            <span>🔬 AI Certified</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Platform Features</span>
            <h2 className="section-title">Everything You Need for<br />Modern Farming</h2>
            <p className="section-description">AI-powered tools, expert knowledge, and premium inputs — all in one place</p>
          </div>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div className="feature-card" key={idx} onClick={() => navigate(feature.action)}>
                <div className="feature-icon" style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)` }}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.desc}</p>
                <button className="feature-link">
                  Learn More <FaArrowRight />
                </button>
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
              <div className="step-number">01</div>
              <div className="step-icon">📊</div>
              <h3>Upload Your Data</h3>
              <p>Share your soil parameters, crop type, and location</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">🤖</div>
              <h3>AI Analysis</h3>
              <p>Our AI analyzes your data using advanced algorithms</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">📋</div>
              <h3>Get Recommendations</h3>
              <p>Receive personalized crop and fertilizer advice</p>
            </div>
            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-icon">🚚</div>
              <h3>Order Products</h3>
              <p>Shop recommended products delivered to your door</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Team</span>
            <h2 className="section-title">Meet Our Experts</h2>
            <p className="section-description">Dedicated professionals working to transform agriculture</p>
          </div>
          <div className="team-grid">
            {teamMembers.map((member, idx) => (
              <div className="team-card" key={idx}>
                <div className="team-avatar">
                  <span className="avatar-emoji">{member.avatar}</span>
                  <div className="avatar-icon">{member.icon}</div>
                </div>
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
                <div className="team-social">
                  <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
                  <a href={member.social.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                  <a href={member.social.github} target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                </div>
              </div>
            ))}
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
                <FaQuoteLeft className="quote-icon" />
                <p className="testimonial-content">{testimonial.content}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div>
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
                <div className="testimonial-rating">
                  {'★'.repeat(testimonial.rating)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="stats-counter">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <FaUsers className="stat-icon" />
              <div className="stat-number">50,000+</div>
              <div className="stat-label">Farmers Served</div>
            </div>
            <div className="stat-item">
              <FaCheckCircle className="stat-icon" />
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
            <div className="stat-item">
              <FaHandHoldingHeart className="stat-icon" />
              <div className="stat-number">500+</div>
              <div className="stat-label">Products</div>
            </div>
            <div className="stat-item">
              <FaAward className="stat-icon" />
              <div className="stat-number">24/7</div>
              <div className="stat-label">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-wrapper">
            <div className="cta-content">
              <h2>Ready to Transform Your Farming?</h2>
              <p>Join thousands of farmers using Harvestify to increase yields and reduce costs</p>
              <button className="btn-primary" onClick={() => navigate('/crops')}>
                Start Free Trial <FaArrowRight />
              </button>
            </div>
            <div className="cta-image">
              <span className="cta-emoji">🌾</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-wrapper">
            <div className="contact-info">
              <span className="section-badge">Get in Touch</span>
              <h2>Have Questions?<br />We're Here to Help</h2>
              <p>Our team of agronomists is ready to assist you with any questions about our services</p>
              <div className="contact-details">
                <div className="contact-item">
                  <FaPhoneAlt className="contact-icon" />
                  <div>
                    <strong>Phone</strong>
                    <p>+91 98765 43210</p>
                  </div>
                </div>
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <div>
                    <strong>Email</strong>
                    <p>support@harvestify.in</p>
                  </div>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
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
              <button type="submit" className="btn-primary">
                Send Message <FaArrowRight />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
