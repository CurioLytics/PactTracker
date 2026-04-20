import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, Target, Zap, Clock } from 'lucide-react'
import useStore from '../store/useStore'

const Welcome = () => {
  
  const [slide, setSlide] = useState(0)

  const slides = [
    {
      badge: "Editorial Actionism",
      title: <>Bạn muốn thử nghiệm <br /><span className="accent-text">điều gì</span> tiếp theo?</>,
      quote: "Kỷ luật là cầu nối giữa mục tiêu và thành tựu.",
      icon: <Sparkles size={40} className="accent-text" />,
      button: "Bắt đầu thử nghiệm"
    },
    {
      badge: "Phương pháp PACT",
      title: <>Thiết lập thử nghiệm <br /><span className="accent-text">tí hon</span></>,
      desc: "PACT tập trung vào Output (Sản lượng): Purposeful (Có mục đích), Actionable (Khả thi), Continuous (Liên tục) và Trackable (Theo dõi).",
      icon: <Target size={40} className="accent-text" />,
      button: "Tiếp tục"
    },
    {
      badge: "Sẵn sàng",
      title: <>Chào mừng bạn đến với <br /><span className="accent-text">PACT</span></>,
      desc: "Chúng ta hãy bắt đầu bằng việc đặt tên cho hành trình này. Bạn là ai?",
      icon: <Zap size={40} className="accent-text" />,
      button: "Tiếp tục",
      isNameStep: true
    }
  ]

  const [name, setName] = useState('')
  const setUser = useStore((state) => state.setUser)

  const nextSlide = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1)
    } else {
      if (slides[slide].isNameStep && name) {
        setUser({ name, onboarded: false }) // onboarded: false because we still need PACT and PIN
        setScreen('onboarding')
      } else if (!slides[slide].isNameStep) {
        setSlide(slide + 1)
      }
    }
  }

  const prevSlide = () => {
    if (slide > 0) setSlide(slide - 1)
  }

  const current = slides[slide]

  return (
    <div className="welcome-container">
      <AnimatePresence mode="wait">
        <motion.div 
          key={slide}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="welcome-content"
        >
          <div className="badge">
            <Sparkles size={14} />
            <span>{current.badge}</span>
          </div>
          
          <div className="welcome-icon-wrapper">
            {current.icon}
          </div>

          <h1 className="welcome-title">
            {current.title}
          </h1>
          
          {current.quote && <p className="welcome-quote">“{current.quote}”</p>}
          {current.desc && <p className="welcome-desc">{current.desc}</p>}
          
          {current.isNameStep && (
            <div className="input-group" style={{ marginTop: '2rem' }}>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên của bạn..."
                className="welcome-input"
                autoFocus
              />
            </div>
          )}
          
          <div className="button-group-onboarding">
            {slide > 0 && (
              <button onClick={prevSlide} className="secondary-button-icon">
                <ArrowLeft size={20} />
              </button>
            )}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextSlide}
              className="primary-button"
            >
              {current.button}
              <ArrowRight size={18} />
            </motion.button>
          </div>

          <div className="slide-indicators">
            {slides.map((_, i) => (
              <div key={i} className={`indicator ${i === slide ? 'active' : ''}`} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Decorative background elements */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
    </div>
  )
}

export default Welcome

