import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Settings, Flame, Plus } from 'lucide-react'
import confetti from 'canvas-confetti'
import useStore from '../store/useStore'
import DailyLogModal from '../components/ui/DailyLogModal'

// Local timezone-safe date string
const getLocalDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser)
  const account = useStore((state) => state.accounts[currentUser] || { pacts: [] })
  const pacts = account.pacts.filter(p => p.status === 'inprogress')

  const setEditingPact = useStore((state) => state.setEditingPact)
  const completePact = useStore((state) => state.completePact)
  const redoPact = useStore((state) => state.redoPact)
  const saveLog = useStore((state) => state.saveLog)
  const refreshPacts = useStore((state) => state.refreshPacts)
  const setActivePactId = useStore((state) => state.setActivePactId)

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'log',    // 'log' | 'undo'
    pactId: null,
    existingLog: null
  });

  useEffect(() => {
    refreshPacts()
  }, [refreshPacts])

  const todayStr = getLocalDateStr();

  const handleCompleteClick = (e, pact) => {
    e.stopPropagation();
    const isCompletedToday = pact.lastCompleted === todayStr;

    if (isCompletedToday) {
      // Show undo confirmation modal
      const existingLog = pact.logs?.[todayStr] || null;
      setModalState({ isOpen: true, mode: 'undo', pactId: pact.id, existingLog });
    } else {
      // Complete the pact first
      const attemptComplete = async () => {
        await completePact(pact.id);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#646cff', '#ffffff', '#b993d6']
        });
        // Show log modal after confetti
        setTimeout(() => {
          setModalState({ isOpen: true, mode: 'log', pactId: pact.id, existingLog: null });
        }, 800);
      };
      attemptComplete();
    }
  };

  const handleModalClose = () => {
    setModalState(s => ({ ...s, isOpen: false }));
  };

  const handleSubmitLog = async (logData) => {
    if (modalState.pactId) {
      await saveLog(modalState.pactId, todayStr, logData);
    }
  };

  const handleConfirmUndo = async () => {
    if (modalState.pactId) {
      // redoPact already removes the log in the store
      await redoPact(modalState.pactId);
    }
  };

  const handleSelectPact = async (id) => {
    await setActivePactId(id)
    navigate('/analytics')
  }

  const handleCreateNew = () => {
    setEditingPact(null)
    navigate('/create-pact')
  }

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  // Find active pact for modal to read its logs
  const modalPact = account.pacts.find(p => p.id === modalState.pactId);

  return (
    <div className="container dashboard-container no-scrollbar">
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div className="header-left">
          <h1 className="pact-logo">PACT<span>.</span>HOME</h1>
          <p className="today-date">{today}</p>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/settings')} className="icon-button">
            <Settings size={24} />
          </button>
        </div>
      </header>

      <section className="pact-overview">
        {pacts.length > 0 ? (
          pacts.map((pact) => {
            const isCompletedToday = pact.lastCompleted === todayStr;
            return (
              <motion.div
                key={pact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`pact-card glass ${isCompletedToday ? 'completed' : ''}`}
              >
                <div className="pact-card-inner" onClick={() => handleSelectPact(pact.id)} style={{ cursor: 'pointer' }}>
                  <div className="pact-card-content">
                    <div className="pact-card-header">
                      <div className="pact-badge">
                        <Flame size={12} />
                        <span>Thử nghiệm</span>
                      </div>
                    </div>
                    <h2 className="pact-name">{pact.actionable || pact.title || pact.goal}</h2>
                    <div className="streak-info">
                      <div className="streak-count">
                        <span className="streak-number">{pact.streak}</span>
                        <span className="streak-text">Ngày liên tiếp</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pact-action">
                  <button
                    onClick={(e) => handleCompleteClick(e, pact)}
                    className={`check-button ${isCompletedToday ? 'active' : ''}`}
                  >
                    <CheckCircle2 size={32} />
                    <div className="check-btn-text">
                      <span className="main-status">{isCompletedToday ? 'Hoàn thành' : 'Xác nhận'}</span>
                      {isCompletedToday && <span className="redo-hint"></span>}
                    </div>
                  </button>
                </div>
              </motion.div>
            )
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="empty-state-editorial"
          >
            <div className="empty-state-visual glass">
              <span className="visual-icon">✨</span>
            </div>
            <h2 className="empty-title">Bắt đầu thử nghiệm</h2>
            <p className="empty-subtitle">
              Sức mạnh của những thay đổi nhỏ sẽ tạo nên bản sắc mới. Hãy chọn một ý tưởng từ Wishlist hoặc bắt đầu một thử nghiệm mới.
            </p>
            <div className="button-group-vertical">
              <button onClick={() => navigate('/history')} className="primary-button mb-4">
                Vào Wishlist
              </button>
              <button onClick={handleCreateNew} className="secondary-button">
                Bắt đầu thử nghiệm
              </button>
            </div>
          </motion.div>
        )}
      </section>

      <section className="quote-section">
        <p className="quote-text">
          "Kỷ luật là cầu nối giữa mục tiêu và thành tựu."
        </p>
        <p className="quote-author">Jim Rohn</p>
      </section>

      <DailyLogModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        existingLog={modalState.mode === 'undo' ? (modalPact?.logs?.[todayStr] || null) : null}
        onSubmitLog={handleSubmitLog}
        onConfirmUndo={handleConfirmUndo}
        onClose={handleModalClose}
      />

      <style>{`
        .dashboard-container {
          padding: 1.5rem;
          padding-bottom: 7rem;
        }
        .pact-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--accent);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }

        .check-btn-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .main-status {
          font-weight: 700;
        }
        .redo-hint {
          font-size: 0.65rem;
          opacity: 0.7;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

export default Dashboard
