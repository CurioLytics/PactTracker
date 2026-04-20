import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { History as HistoryIcon, LayoutGrid, CheckCircle2, Bookmark, Timer, ChevronRight, Flame, Plus } from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser);
  const account = useStore((state) => state.accounts[currentUser] || { pacts: [] });
  const pacts = account.pacts;
  const { setActivePactId, setEditingPact, addPact } = useStore();
  
  const [filter, setFilter] = useState('all'); // all, inprogress, done, wishlist
  const [newIdea, setNewIdea] = useState('');

  const handleAddIdea = () => {
    if (!newIdea.trim()) return;
    addPact({
      id: Date.now().toString(),
      purposeful: newIdea.trim(),
      actionable: newIdea.trim(),
      status: 'wishlist',
      streak: 0,
      createdAt: new Date().toISOString()
    });
    setNewIdea('');
  };

  const filteredPacts = pacts.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': return <CheckCircle2 size={16} />;
      case 'wishlist': return <Bookmark size={16} />;
      case 'inprogress': return <Flame size={16} />;
      default: return <Timer size={16} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'done': return 'Hoàn thành';
      case 'wishlist': return 'Wishlist';
      case 'inprogress': return 'Đang thực thi';
      default: return status;
    }
  };

  const handleCardClick = (pact) => {
    if (pact.status === 'wishlist') {
      setEditingPact(pact);
      navigate('/create-pact');
    } else {
      setActivePactId(pact.id);
      navigate('/analytics');
    }
  };

  return (
    <div className="container history-container no-scrollbar">
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="pact-logo">PACT<span>.</span>HISTORY</h1>
          <p className="today-date">Nhìn lại hành trình của bạn</p>
        </div>
      </header>

      <div className="filter-chips">
        {['all', 'inprogress', 'done', 'wishlist'].map(f => (
          <button 
            key={f}
            className={`chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tất cả' : getStatusLabel(f)}
          </button>
        ))}
      </div>

      {filter === 'wishlist' && (
        <div className="quick-idea-input glass" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: '16px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Nhập ý tưởng mới cực nhanh..." 
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            className="editorial-input"
            style={{ flex: 1, margin: 0, padding: 0, border: 'none', background: 'transparent' }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddIdea()}
          />
          <button 
            className="primary-button" 
            onClick={handleAddIdea}
            disabled={!newIdea.trim()}
            style={{ padding: '0.5rem 1rem', borderRadius: '12px', minHeight: 'auto' }}
          >
            <Plus size={20} />
          </button>
        </div>
      )}

      <div className="history-list">
        {filteredPacts.length > 0 ? (
          filteredPacts.map(pact => (
            <div 
              key={pact.id} 
              className={`history-card glass status-${pact.status}`}
              onClick={() => handleCardClick(pact)}
            >
              <div className="history-card-info">
                <div className={`status-badge ${pact.status}`}>
                  {getStatusIcon(pact.status)}
                  <span>{getStatusLabel(pact.status)}</span>
                </div>
                <h3>{pact.actionable || pact.goal}</h3>
                <div className="history-stats">
                  <span className="streak-tag">{pact.streak} ngày liên tiếp</span>
                </div>
              </div>
              <ChevronRight size={20} className="chevron" />
            </div>
          ))
        ) : (
          <div className="empty-state-editorial">
            <div className="empty-state-visual glass">
              <HistoryIcon size={32} className="visual-icon" style={{ opacity: 0.5 }} />
            </div>
            <h3 className="empty-title">Chưa có gì ở đây</h3>
            <p className="empty-subtitle">Bắt đầu những thói quen nhỏ ngay hôm nay.</p>
          </div>
        )}
      </div>

      <style>{`
        .history-container {
          padding: 1.5rem;
          padding-bottom: 7rem;
        }
        .filter-chips {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding: 0.5rem 0;
          scrollbar-width: none;
        }
        .filter-chips::-webkit-scrollbar { display: none; }
        
        .chip {
          padding: 0.6rem 1.2rem;
          border-radius: 100px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }
        
        .chip.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
        
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .history-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .history-card:hover {
          transform: translateX(5px);
          background: rgba(255, 255, 255, 0.08);
        }
        
        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          width: fit-content;
        }

        .status-badge.done { color: #2ecc71; background: rgba(46, 204, 113, 0.1); }
        .status-badge.wishlist { color: #f1c40f; background: rgba(241, 196, 15, 0.1); }
        .status-badge.inprogress { color: var(--accent); background: rgba(100, 108, 255, 0.1); }
        
        .history-card-info h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }
        
        .streak-tag {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.4rem;
          display: block;
        }
        
        .chevron {
          color: var(--text-secondary);
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};

export default History;
