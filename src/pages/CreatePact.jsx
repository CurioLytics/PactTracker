import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, Info, Target, Sparkles, Calendar, Clock, PlayCircle, BookMarked, Activity } from 'lucide-react'
import useStore from '../store/useStore'

const CreatePact = () => {
  const [step, setStep] = useState(1)

  // PACT Methodology Data
  const [purposeful, setPurposeful] = useState('')
  const [actionable, setActionable] = useState('')
  const [frequency, setFrequency] = useState(1) // Every X days
  const [duration, setDuration] = useState(14)
  const [trackable, setTrackable] = useState('')

  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser)

  const addPact = useStore((state) => state.addPact)
  const updatePact = useStore((state) => state.updatePact)
  const editingPact = useStore((state) => state.editingPact)
  const setEditingPact = useStore((state) => state.setEditingPact)

  // Get account to check if it's the first pact
  const account = useStore((state) => state.accounts[currentUser] || { pacts: [] })

  // Pre-fill if editing/activating
  useEffect(() => {
    if (editingPact) {
      setPurposeful(editingPact.purposeful || editingPact.vision || '')
      setActionable(editingPact.actionable || editingPact.action || '')
      setFrequency(editingPact.frequency || 1)
      setDuration(editingPact.duration || 14)
      setTrackable(editingPact.trackable || editingPact.hypothesis || '')
    } else {
      setStep(1)
    }
  }, [editingPact])

  const handleFinish = async () => {
    const pactData = {
      purposeful,
      actionable,
      frequency,
      duration,
      trackable,
      status: 'inprogress'
    }

    if (editingPact?.id) {
      await updatePact(editingPact.id, pactData)
    } else {
      await addPact(pactData)
    }

    setEditingPact(null)
    navigate('/')
  }

  const durationOptions = [
    { value: 7, label: '7 Ngày', desc: 'Khởi động' },
    { value: 14, label: '14 Ngày', desc: 'Xây dựng' },
    { value: 21, label: '21 Ngày', desc: 'Thử thách' },
    { value: 30, label: '30 Ngày', desc: 'Bền vững' }
  ]

  const totalSteps = 5;

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      navigate('/')
    }
  }

  const progressPercent = (step / totalSteps) * 100

  return (
    <div className="container create-pact-screen no-scrollbar">
      <header className="pact-header">
        <button
          onClick={handleBack}
          className="icon-button"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="header-title">Lập Cam Kết Mới</div>
        <div style={{ width: 40 }}></div>
      </header>

      <main className="pact-main">
        <div className="wizard-progress-section">
          <span className="wizard-step-indicator">BƯỚC {step} / {totalSteps}</span>
          <div className="wizard-progress-container">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <div className="editorial-header">
                <Target size={32} className="text-accent mb-4" />
                <h1 className="pact-title">Tầm nhìn của bạn là gì? 🎯</h1>
                <p className="pact-subtitle">Hãy bắt đầu bằng một mục tiêu thật ý nghĩa (Purposeful).</p>
              </div>

              <div className="input-group">
                <label>Ước mơ / Tầm nhìn lớn lao (Vision)</label>
                <textarea
                  value={purposeful}
                  onChange={(e) => setPurposeful(e.target.value)}
                  placeholder="Ví dụ: Trở thành chiến thần TOEIC, Dậy sớm để làm chủ ngày mới, Có body 6 múi đón hè..."
                  className="editorial-input textarea"
                  rows={5}
                />
                <p className="input-hint">Mục tiêu ý nghĩa là chìa khóa để bạn không bao giờ bỏ cuộc.</p>
              </div>

              <button
                disabled={!purposeful}
                onClick={() => setStep(2)}
                className="primary-button full-width"
              >
                Tiếp theo
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <div className="editorial-header">
                <Sparkles size={32} className="text-accent mb-4" />
                <h1 className="pact-title">Hành động cụ thể 🚀</h1>
                <p className="pact-subtitle">Chia nhỏ mục tiêu thành các hành động dễ thực hiện (Actionable).</p>
              </div>

              <div className="input-group">
                <label>Việc bạn sẽ làm mỗi ngày</label>
                <textarea
                  value={actionable}
                  onChange={(e) => setActionable(e.target.value)}
                  placeholder="Ví dụ: Học 10 từ vựng qua meme, Chạy bộ 2 vòng hồ, Xem 1 video kiến thức trên Tốp Tốp..."
                  className="editorial-input textarea"
                  rows={4}
                />
                <p className="input-hint">Hành động càng nhỏ và cụ thể, bạn càng dễ thành công.</p>
              </div>

              <button
                disabled={!actionable}
                onClick={() => setStep(3)}
                className="primary-button full-width"
              >
                Tiếp theo
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <div className="editorial-header">
                <Clock size={32} className="text-accent mb-4" />
                <h1 className="pact-title">Duy trì nhịp điệu ⏰</h1>
                <p className="pact-subtitle">Sự vĩ đại đến từ sự lặp lại (Continuous).</p>
              </div>

              <div className="input-group">
                <label>Tần suất thực hiện</label>
                <div className="frequency-selector glass">
                  <span className="freq-label">Mỗi</span>
                  <input
                    type="number"
                    value={frequency}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setFrequency(Math.min(30, Math.max(1, val)));
                    }}
                    className="freq-input"
                    min="1"
                    max="30"
                  />
                  <span className="freq-label">ngày</span>
                </div>
              </div>

              <div className="input-group mt-8">
                <label>Thời gian thử nghiệm</label>
                <div className="duration-grid">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDuration(opt.value)}
                      className={`duration-card ${duration === opt.value ? 'active' : ''}`}
                    >
                      <span className="duration-value">{opt.value}</span>
                      <span className="duration-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(4)}
                className="primary-button full-width mt-8"
              >
                Tiếp theo
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <div className="editorial-header">
                <Activity size={32} className="text-accent mb-4" />
                <h1 className="pact-title">Đo lường kết quả 📊</h1>
                <p className="pact-subtitle">Làm sao để biết bạn đã hoàn thành? (Trackable).</p>
              </div>

              <div className="input-group">
                <label>Chỉ số hoặc bằng chứng hoàn thành</label>
                <textarea
                  value={trackable}
                  onChange={(e) => setTrackable(e.target.value)}
                  placeholder="Ví dụ: Chụp ảnh màn hình app học tập, Quay clip timelapse, Check-in tại phòng gym..."
                  className="editorial-input textarea"
                  rows={5}
                />
                <p className="input-hint">Có bằng chứng rõ ràng giúp bạn cảm thấy 'high' hơn khi hoàn thành.</p>
              </div>

              <button
                disabled={!trackable}
                onClick={() => setStep(5)}
                className="primary-button full-width"
              >
                Xem lại cam kết
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content text-center"
            >
              <div className="final-check glass">
                <div className="success-icon-wrapper mb-4">
                  <Check size={48} className="text-green" />
                </div>
                <h1 className="pact-title">Xác nhận PACT ✍️</h1>
                <p className="pact-subtitle">
                  Hành trình thay đổi bản thân của bạn bắt đầu từ đây.
                </p>

                <div className="pact-preview-summary">
                  <div className="preview-item">
                    <span className="preview-label">Tầm nhìn (Vision):</span>
                    <span className="preview-value line-clamp-2">{purposeful}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Hành động cốt lõi:</span>
                    <span className="preview-value line-clamp-2">{actionable}</span>
                  </div>
                  <div className="preview-row">
                    <div className="preview-item">
                      <span className="preview-label">Tần suất:</span>
                      <span className="preview-value">{frequency} ngày/lần</span>
                    </div>
                    <div className="preview-item">
                      <span className="preview-label">Thời gian:</span>
                      <span className="preview-value">{duration} ngày</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleFinish()}
                className="primary-button full-width"
              >
                🚀 Kích hoạt PACT Ngay
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .frequency-selector {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 1rem;
          background: rgba(var(--accent-rgb), 0.05);
        }
        .freq-input {
          background: none;
          border: none;
          border-bottom: 2px solid var(--accent);
          color: var(--text-primary);
          font-size: 2rem;
          font-weight: 700;
          width: 60px;
          text-align: center;
          outline: none;
        }
        .freq-label {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .input-hint {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          margin-top: 0.5rem;
          font-style: italic;
        }
        .final-check {
          padding: 2rem;
          border-radius: 1.5rem;
          margin-bottom: 2rem;
          background: var(--surface);
          border: 1px solid var(--border);
        }
        .success-icon-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(var(--green-rgb), 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        .pact-preview-summary {
          margin-top: 2rem;
          text-align: left;
          background: rgba(var(--text-primary-rgb), 0.03);
          padding: 1.5rem;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .preview-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .preview-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }
        .preview-value {
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 500;
          line-height: 1.5;
        }
        .preview-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default CreatePact
