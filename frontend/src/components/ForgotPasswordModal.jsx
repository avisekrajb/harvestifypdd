import React, { useState, useEffect, useRef } from 'react'
import { FaEnvelope, FaLock, FaArrowLeft, FaCheckCircle, FaSpinner } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './ForgotPasswordModal.css'

const ForgotPasswordModal = ({ onClose, onBack }) => {
  const { forgotPassword, verifyOtp, resetPassword } = useAuth()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', '']) // 6 digits
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')
  
  const inputRefs = useRef([])

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000)
      return () => clearInterval(interval)
    } else if (timer === 0 && step === 2) {
      setResendDisabled(false)
    }
  }, [timer, step])

  // Auto-focus first OTP input when step changes to OTP verification
  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [step])

  const handleSendOtp = async () => {
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }
    
    setLoading(true)
    setResendDisabled(true)
    const result = await forgotPassword(email)
    if (result.success) {
      setStep(2)
      setTimer(60)
      toast.success(`Verification code sent to ${email}`)
      // Reset OTP fields
      setOtp(['', '', '', '', '', ''])
    } else {
      setResendDisabled(false)
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code')
      return
    }
    
    setLoading(true)
    const result = await verifyOtp(email, otpCode)
    if (result.success) {
      setStep(3)
      toast.success('Code verified! Create your new password')
    }
    setLoading(false)
  }

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill all fields')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    // Password strength validation
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    // Check for at least one number
    if (!/\d/.test(newPassword)) {
      toast.error('Password must contain at least one number')
      return
    }
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      toast.error('Password must contain at least one uppercase letter')
      return
    }
    
    setLoading(true)
    const result = await resetPassword(email, newPassword)
    if (result.success) {
      toast.success('Password reset successfully! Please login with your new password')
      setTimeout(() => {
        onBack()
      }, 1500)
    }
    setLoading(false)
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    
    // Auto-submit when all digits are filled
    if (value && index === 5 && newOtp.every(digit => digit !== '')) {
      const allFilled = [...newOtp.slice(0, 5), value].every(d => d !== '')
      if (allFilled) {
        setTimeout(() => handleVerifyOtp(), 100)
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle paste event
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6)
        if (digits.length === 6) {
          const newOtp = [...otp]
          digits.split('').forEach((digit, i) => {
            if (i < 6) newOtp[i] = digit
          })
          setOtp(newOtp)
          if (newOtp.every(d => d !== '')) {
            setTimeout(() => handleVerifyOtp(), 100)
          }
        }
      })
    }
  }

  const checkPasswordStrength = (password) => {
    if (!password) return ''
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    if (strength <= 2) return 'weak'
    if (strength <= 3) return 'medium'
    return 'strong'
  }

  const handlePasswordChange = (e) => {
    const password = e.target.value
    setNewPassword(password)
    setPasswordStrength(checkPasswordStrength(password))
  }

  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 'weak': return '#ff6b6b'
      case 'medium': return '#ffd93d'
      case 'strong': return '#6bcf7f'
      default: return '#ccc'
    }
  }

  const getPasswordStrengthText = () => {
    switch(passwordStrength) {
      case 'weak': return 'Weak - Add numbers and uppercase letters'
      case 'medium': return 'Medium - Good, but could be stronger'
      case 'strong': return 'Strong - Excellent password!'
      default: return ''
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="forgot-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        {step === 1 && (
          <>
            <div className="modal-icon">🔐</div>
            <h2>Forgot Password?</h2>
            <p>Enter your email address and we'll send you a 6-digit verification code</p>
            
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendOtp()}
                  autoFocus
                />
              </div>
            </div>
            
            <button 
              className="btn-primary"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" /> Sending...
                </>
              ) : (
                'Send Verification Code →'
              )}
            </button>
            
            <button className="back-link" onClick={onBack}>
              <FaArrowLeft /> Back to Login
            </button>
          </>
        )}
        
        {step === 2 && (
          <>
            <div className="modal-icon">📱</div>
            <h2>Verify Your Identity</h2>
            <p>Enter the 6-digit code sent to <strong>{email}</strong></p>
            
            <div className="otp-container-6digit">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength="1"
                  className="otp-input-6digit"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoComplete="off"
                />
              ))}
            </div>
            
            <div className="timer-text">
              {timer > 0 ? (
                <span>Resend code in <strong>{timer}s</strong></span>
              ) : (
                <button 
                  className="resend-btn" 
                  onClick={handleSendOtp}
                  disabled={resendDisabled}
                >
                  Resend Code
                </button>
              )}
            </div>
            
            <button 
              className="btn-primary"
              onClick={handleVerifyOtp}
              disabled={loading || otp.some(d => d === '')}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" /> Verifying...
                </>
              ) : (
                'Verify Code →'
              )}
            </button>
            
            <button className="back-link" onClick={() => setStep(1)}>
              <FaArrowLeft /> Back to Email
            </button>
          </>
        )}
        
        {step === 3 && (
          <>
            <div className="modal-icon">✨</div>
            <h2>Reset Password</h2>
            <p>Create a new strong password for your account</p>
            
            <div className="form-group">
              <label>New Password</label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  autoFocus
                />
                <button 
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {newPassword && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill ${passwordStrength}`}
                      style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%', background: getPasswordStrengthColor() }}
                    />
                  </div>
                  <span style={{ color: getPasswordStrengthColor() }}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <div className="password-error">
                  <span>❌ Passwords do not match</span>
                </div>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                <div className="password-success">
                  <FaCheckCircle /> Passwords match!
                </div>
              )}
            </div>
            
            <div className="password-requirements">
              <p>Password must contain:</p>
              <ul>
                <li className={newPassword.length >= 6 ? 'valid' : ''}>
                  {newPassword.length >= 6 ? '✓' : '○'} At least 6 characters
                </li>
                <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>
                  {/[A-Z]/.test(newPassword) ? '✓' : '○'} At least one uppercase letter
                </li>
                <li className={/[0-9]/.test(newPassword) ? 'valid' : ''}>
                  {/[0-9]/.test(newPassword) ? '✓' : '○'} At least one number
                </li>
              </ul>
            </div>
            
            <button 
              className="btn-primary"
              onClick={handleResetPassword}
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" /> Resetting...
                </>
              ) : (
                'Reset Password →'
              )}
            </button>
            
            <button className="back-link" onClick={() => setStep(2)}>
              <FaArrowLeft /> Back to Verification
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordModal