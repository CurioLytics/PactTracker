import { useNavigate } from 'react-router-dom';
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Flame,
  Calendar as CalendarIcon,
  Zap,
  Trash2,
  AlertCircle,
  Target,
  Sparkles,
  Activity,
  BarChart3,
  Clock,
  Info,
  Edit3
} from 'lucide-react'
import useStore from '../store/useStore'
import StreakRing from '../components/ui/StreakRing'

// Local timezone-safe date string
const getLocalDateStr = (date) => {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const Analytics = () => {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser)
  const account = useStore((state) => state.accounts[currentUser] || { pacts: [] })
  const activePactId = account.activePactId
  const deletePact = useStore((state) => state.deletePact)
  const setEditingPact = useStore((state) => state.setEditingPact)

  const [activeTab, setActiveTab] = useState('stats') // 'stats' | 'details'
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedLogDate, setSelectedLogDate] = useState(null)

  const activePact = useMemo(() => {
    return account.pacts.find(p => p.id === activePactId)
  }, [account.pacts, activePactId])

  const handleEdit = () => {
    if (activePact) {
      setEditingPact(activePact)
      navigate('/create-pact')
    }
  }

  // If still loading or no active pact
  if (!activePact) {
    return <div className="container p-8">Đang tải...</div>
  }

  const progressPercent = Math.round(Math.min((activePact.streak / (activePact.duration || 14)) * 100, 100))

  const completedCount = activePact.history?.length || 0
  const today = new Date()
  const createdDate = new Date(activePact.createdAt)
  const createdDateStr = getLocalDateStr(createdDate)
  const todayStr = getLocalDateStr(today)

  const activeDays = Math.max(Math.ceil((today - createdDate) / (1000 * 60 * 60 * 24)) + 1, 1)
  const performanceRate = activeDays > 0 ? Math.round((completedCount / activeDays) * 100) : 0

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const emptyDays = firstDay === 0 ? 6 : firstDay - 1
    const days = new Array(emptyDays).fill(null)
    const lastDay = new Date(year, month + 1, 0).getDate()
    for (let i = 1; i <= lastDay; i++) days.push(new Date(year, month, i))
    return days
  }, [currentMonth])

  const monthName = currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })

  const activityLogs = useMemo(() => {
    const logs = []
    for (let i = 0; i < activeDays; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = getLocalDateStr(d)

      if (dateStr < createdDateStr) break;

      const wasDone = activePact.history?.includes(dateStr)
      const pactLog = activePact.logs?.[dateStr] || null
      logs.push({
        dateStr,
        success: wasDone,
        pactLog,
        title: i === 0 ? 'Hôm nay' : i === 1 ? 'Hôm qua' : d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' }),
        desc: wasDone ? `Hành động đã hoàn tất` : `Chưa ghi nhận hành động`
      })
    }
    return logs
  }, [activePact, createdDateStr, activeDays])

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hệ thống PACT này?')) {
      deletePact(activePact.id)
      navigate('/')
    }
  }

  return (
    <div className="container analytics-redesign no-scrollbar">
      <header className="pact-top-bar">
        <button className="icon-btn-minimal" onClick={() => navigate(activePact.status === 'inprogress' ? '/' : '/history')}>
          <ChevronLeft size={24} />
        </button>

        <div className="header-center">
          <h2 className="pact-name-header">{activePact.actionable || activePact.goal}</h2>
        </div>

        <div className="header-right" style={{ width: 40 }}></div>
      </header>

      <div className="tab-switcher glass">
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <TrendingUp size={18} />
          Tiến độ
        </button>
        <button
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <Info size={18} />
          Chi tiết PACT
        </button>
      </div>

      <main className="analytics-scroll-area">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' ? (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="tab-content"
            >
              <section className="analytics-ring-section">
                <div className="ring-container">
                  <StreakRing progress={progressPercent} size={200} strokeWidth={12} />
                  <div className="ring-label-overlay">
                    <span className="percent-val">{progressPercent}%</span>
                    <span className="percent-sub">TIẾN ĐỘ</span>
                  </div>
                </div>

                <div className="streak-pill-container">
                  <div className="streak-pill-badge">
                    <Flame size={18} />
                    <span>{activePact.streak} NGÀY LIÊN TIẾP</span>
                  </div>
                </div>
              </section>

              <div className="stats-grid">
                <div className="stat-item glass">
                  <span className="stat-lbl">Chỉ số tin cậy</span>
                  <div className="stat-main">
                    <TrendingUp size={18} className="text-accent" />
                    <span className="stat-val">{performanceRate}%</span>
                  </div>
                </div>
                <div className="stat-item glass">
                  <span className="stat-lbl">Ngày hoàn tất</span>
                  <div className="stat-main">
                    <CheckCircle2 size={18} className="text-green" />
                    <span className="stat-val">{completedCount}</span>
                  </div>
                </div>
              </div>

              <section className="calendar-card glass">
                <div className="calendar-header">
                  <span className="month-display">{monthName}</span>
                  <div className="cal-nav">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                      <ChevronLeft size={14} />
                    </button>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
                <div className="weekday-header">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="calendar-grid">
                  {calendarDays.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} className="cal-day empty" />
                    const dateStr = getLocalDateStr(day)
                    const isToday = dateStr === todayStr
                    const isDone = activePact.history?.includes(dateStr)
                    const isMissed = dateStr < todayStr && !isDone && dateStr >= createdDateStr

                    return (
                      <div key={dateStr} className={`cal-day ${isToday ? 'is-today' : ''} ${isDone ? 'done' : isMissed ? 'missed' : ''}`}>
                        {day.getDate()}
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="activity-logs">
                <h3 className="history-title-editorial">Lịch sử  </h3>
                <div className="logs-list">
                  {activityLogs.length > 0 ? activityLogs.map((log, index) => (
                    <div
                      key={log.dateStr}
                      className={`log-entry glass ${log.pactLog ? 'has-log' : ''}`}
                      onClick={() => setSelectedLogDate(selectedLogDate === log.dateStr ? null : log.dateStr)}
                      style={{ cursor: log.pactLog ? 'pointer' : 'default' }}
                    >
                      <div className={`log-indicator-circle ${log.success ? 'success' : 'failure'}`}>
                        {log.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      </div>
                      <div className="log-content" style={{ flex: 1 }}>
                        <div className="log-header">
                          <span className="log-date-title">{log.title}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {log.pactLog && (
                              <span className="log-has-note-badge">📝 Nhật ký</span>
                            )}
                            <span className={`log-status-badge ${log.success ? 'success' : 'failure'}`}>
                              {log.success ? 'HOÀN THÀNH' : 'BỎ LỠ'}
                            </span>
                          </div>
                        </div>
                        {/* Expanded log detail */}
                        {selectedLogDate === log.dateStr && log.pactLog && (
                          <div className="log-detail-expand">
                            {log.pactLog.whatWorked && (
                              <div className="log-detail-item">
                                <span className="log-detail-dot" style={{ background: '#2ecc71' }} />
                                <div>
                                  <p className="log-detail-label">Điều đã hiệu quả</p>
                                  <p className="log-detail-text">{log.pactLog.whatWorked}</p>
                                </div>
                              </div>
                            )}
                            {log.pactLog.whatDidntWork && (
                              <div className="log-detail-item">
                                <span className="log-detail-dot" style={{ background: '#f39c12' }} />
                                <div>
                                  <p className="log-detail-label">Điều chưa hiệu quả</p>
                                  <p className="log-detail-text">{log.pactLog.whatDidntWork}</p>
                                </div>
                              </div>
                            )}
                            {log.pactLog.whatNext && (
                              <div className="log-detail-item">
                                <span className="log-detail-dot" style={{ background: 'var(--accent)' }} />
                                <div>
                                  <p className="log-detail-label">Bước tiếp theo</p>
                                  <p className="log-detail-text">{log.pactLog.whatNext}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="logs-empty glass">Chưa có lịch sử  </div>
                  )}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="tab-content"
            >
              <section className="status-banner glass">
                <div className="status-label">Trạng thái PACT</div>
                <div className={`status-value ${activePact.status}`}>
                  {activePact.status === 'inprogress' ? '🚀 Đang thực thi' : '✅ Đã hoàn thành'}
                </div>
                <div className="status-hint">
                  Tự động hoàn thành sau {activePact.duration} ngày
                </div>
              </section>

              <section className="pact-pillars">
                <div className="pillar-card glass">
                  <div className="pillar-header">
                    <Target size={20} className="text-accent" />
                    <span className="pillar-title">Purposeful (Mục đích)</span>
                  </div>
                  <p className="pillar-content">{activePact.purposeful || activePact.vision || "Đang cập nhật..."}</p>
                </div>

                <div className="pillar-card glass">
                  <div className="pillar-header">
                    <Sparkles size={20} className="text-accent" />
                    <span className="pillar-title">Actionable (Hành động)</span>
                  </div>
                  <p className="pillar-content">{activePact.actionable || activePact.action || activePact.goal}</p>
                </div>

                <div className="pillar-card glass">
                  <div className="pillar-header">
                    <Clock size={20} className="text-accent" />
                    <span className="pillar-title">Continuous (Liên tục)</span>
                  </div>
                  <div className="pillar-stats">
                    <div className="stat-minor">
                      <span className="lbl">Chu kỳ:</span>
                      <span className="val">Mỗi {activePact.frequency || 1} ngày</span>
                    </div>
                    <div className="stat-minor">
                      <span className="lbl">Tổng thời gian:</span>
                      <span className="val">{activePact.duration || 14} ngày</span>
                    </div>
                  </div>
                </div>

                <div className="pillar-card glass">
                  <div className="pillar-header">
                    <Activity size={20} className="text-accent" />
                    <span className="pillar-title">Trackable (Đo lường)</span>
                  </div>
                  <p className="pillar-content">{activePact.trackable || activePact.hypothesis || "Đang cập nhật..."}</p>
                </div>

                <div className="detail-actions-row">
                  <button
                    className="edit-pact-btn"
                    onClick={() => {
                      setEditingPact(activePact);
                      navigate('/create-pact');
                    }}
                  >
                    Sửa PACT
                  </button>
                  <button
                    className="delete-pact-btn"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa PACT này?')) {
                        deletePact(activePact.id);
                        navigate('/');
                      }
                    }}
                  >
                    Xóa PACT
                  </button>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .pact-name-header {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .header-center {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
        }
        .tab-switcher {
          display: flex;
          padding: 0.5rem;
          margin: 1rem 1.5rem;
          border-radius: 12px;
          gap: 0.5rem;
        }
        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 8px;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: var(--accent);
          color: white;
          box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.2);
        }
        .status-banner {
          padding: 1.5rem;
          margin-bottom: 2rem;
          border-radius: 1.5rem;
          text-align: center;
          background: rgba(var(--accent-rgb), 0.05);
        }
        .status-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-tertiary);
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .status-value {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .status-value.inprogress { color: var(--accent); }
        .status-value.done { color: #2ecc71; }
        .status-hint {
          font-size: 0.8rem;
          color: var(--text-secondary);
          opacity: 0.8;
        }
        .pact-pillars {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .pillar-card {
          padding: 1.5rem;
          border-radius: 1.25rem;
        }
        .pillar-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .pillar-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .pillar-content {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }
        .pillar-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .stat-minor {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .stat-minor .lbl { font-size: 0.75rem; color: var(--text-tertiary); }
        .stat-minor .val { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }

        .detail-actions-row {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        .edit-pact-btn {
          flex: 2;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--accent);
          background: rgba(var(--accent-rgb), 0.1);
          color: var(--accent);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .edit-pact-btn:active { transform: scale(0.98); }
        .delete-pact-btn {
          flex: 1;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(231, 76, 60, 0.2);
          background: rgba(231, 76, 60, 0.05);
          color: #e74c3c;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .delete-pact-btn:active { transform: scale(0.98); }

        .analytics-ring-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }
        .streak-pill-container {
          margin-top: -1rem;
          margin-bottom: 2rem;
        }
        .streak-pill-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #2ecc71;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 800;
          box-shadow: 0 4px 15px rgba(46, 204, 113, 0.2);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-item {
          padding: 1.25rem;
          border-radius: 1.25rem;
        }
        .stat-lbl {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-tertiary);
          font-weight: 700;
          display: block;
          margin-bottom: 0.5rem;
        }
        .stat-main {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .stat-val {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .activity-logs {
          margin-top: 2rem;
        }
        .history-title-editorial {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }
        .log-entry {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 0.75rem;
        }
        .log-indicator-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .log-indicator-circle.success { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
        .log-indicator-circle.failure { background: rgba(231, 76, 60, 0.1); color: #e74c3c; }
        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-width: 250px;
        }
        .log-date-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
        .log-status-badge { font-size: 0.7rem; font-weight: 800; }
        .log-status-badge.success { color: #2ecc71; }
        .log-status-badge.failure { color: #e74c3c; }

        .log-has-note-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          padding: 0.15rem 0.45rem;
          border-radius: 6px;
        }
        .log-entry.has-log {
          cursor: pointer;
        }
        .log-entry.has-log:hover {
          background: rgba(255,255,255,0.06);
        }
        .log-detail-expand {
          margin-top: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--glass-border);
        }
        .log-detail-item {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
        }
        .log-detail-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 0.35rem;
        }
        .log-detail-label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
          margin: 0 0 0.2rem;
        }
        .log-detail-text {
          font-size: 0.87rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }
      `}</style>
    </div>
  )
}

export default Analytics
