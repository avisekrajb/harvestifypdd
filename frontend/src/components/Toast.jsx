import React, { useEffect } from 'react'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa'
import './Toast.css'

const Toast = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="toast-icon success" />
      case 'error':
        return <FaExclamationCircle className="toast-icon error" />
      case 'info':
        return <FaInfoCircle className="toast-icon info" />
      default:
        return null
    }
  }

  return (
    <div className={`toast toast-${type}`}>
      {getIcon()}
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <FaTimes />
      </button>
      <div className="toast-progress" style={{ animationDuration: `${duration}ms` }} />
    </div>
  )
}

export default Toast