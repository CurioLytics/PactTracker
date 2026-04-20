import { useNavigate } from 'react-router-dom';
import React from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Trash2, 
  Info,
  ExternalLink,
  ShieldCheck,
  Lock,
  LogOut,
  User,
  Heart,
  ChevronRight
} from 'lucide-react'
import useStore from '../store/useStore'

const Settings = () => {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser)
  const account = useStore((state) => state.accounts[currentUser] || { pacts: [] })
  
  const theme = account.theme || 'light'
  const toggleTheme = useStore((state) => state.toggleTheme)
  const exportData = useStore((state) => state.exportData)
  const importData = useStore((state) => state.importData)
  const deleteAllData = useStore((state) => state.deleteAllData)
  const logout = useStore((state) => state.logout)

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const success = await importData(event.target.result)
        if (success) {
          alert('Khôi phục dữ liệu thành công!')
          navigate('/')
        } else {
          alert('Dữ liệu không hợp lệ hoặc lỗi trong quá trình đồng bộ!')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleDeleteData = async () => {
    if (window.confirm('CẢNH BÁO: Tất cả PACT của ' + currentUser + ' sẽ bị xóa vĩnh viễn trên Cloud. Bạn có chắc chắn?')) {
      const success = await deleteAllData()
      if (success) {
        alert('Đã xóa toàn bộ dữ liệu.')
      } else {
        alert('Lỗi khi xóa dữ liệu. Vui lòng thử lại.')
      }
    }
  }

  const wishlistCount = account.pacts.filter(p => p.status === 'wishlist').length

  return (
    <div className="container settings-screen no-scrollbar">
      <header className="settings-header">
        <button className="icon-btn-minimal" onClick={() => navigate('/')}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="settings-header-title">Thiết lập</h1>
      </header>

      <main className="settings-main">
        <section className="user-profile-section glass">
          <div className="user-avatar">
            <User size={32} />
          </div>
          <div className="user-details">
            <h2 className="username-display">{currentUser}</h2>
            <div className="user-stats-mini">
              <span className="stat-pill"><Heart size={12} /> {wishlistCount} Wishlist</span>
            </div>
          </div>
          <button onClick={() => logout()} className="logout-button-mini">
            <LogOut size={18} />
          </button>
        </section>

        <section className="settings-section">
          <h3 className="settings-group-title">Giao diện</h3>
          <div className="theme-switch-wrapper glass" onClick={toggleTheme}>
            <div className="theme-info">
              {theme === 'dark' ? <Moon size={20} className="text-secondary" /> : <Sun size={20} className="text-secondary" />}
              <span className="theme-name">{theme === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}</span>
            </div>
            <div className="toggle-pill"></div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-group-title">Bảo mật</h3>
          <div className="settings-group glass">
            <div className="settings-item" onClick={() => navigate('/change-pin')}>
              <div className="item-left">
                <div className="item-icon security">
                  <Lock size={18} />
                </div>
                <div className="item-info">
                  <span className="item-title">Đổi mã PIN</span>
                  <span className="item-desc">Thay đổi mã khóa bảo vệ</span>
                </div>
              </div>
              <ChevronRight size={18} className="chevron" />
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-group-title">Dữ liệu</h3>
          <div className="settings-group glass">
            <button onClick={exportData} className="settings-item-btn">
              <Download size={18} />
              <span>Xuất dữ liệu (.json)</span>
            </button>
            
            <hr className="settings-divider" />
            
            <label className="settings-item-btn clickable">
              <Upload size={18} />
              <span>Nhập dữ liệu (.json)</span>
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>

            <hr className="settings-divider" />

            <button 
              onClick={handleDeleteData} 
              className="settings-item-btn danger"
            >
              <Trash2 size={18} />
              <span>Xóa dữ liệu tài khoản</span>
            </button>
          </div>
        </section>

        <section className="settings-section mt-8 text-center" style={{ paddingBottom: '2rem' }}>
          <p className="text-xs text-secondary mb-2">PactTracker v2.0.0 (Multi-User)</p>
          <p className="text-xs text-secondary italic">Tiny Experiments Philosophy</p>
        </section>
      </main>

      <style>{`
        .settings-screen {
          padding: 1.5rem;
          padding-bottom: 6rem;
        }
        .settings-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .settings-header-title {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0;
        }
        .user-profile-section {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          border-radius: 1.5rem;
        }
        .user-avatar {
          width: 50px;
          height: 50px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-details {
          flex: 1;
        }
        .username-display {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }
        .user-stats-mini {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }
        .stat-pill {
          font-size: 0.7rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--text-secondary);
        }
        .logout-button-mini {
          background: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .logout-button-mini:hover {
          background: #e74c3c;
          color: white;
        }
        .settings-section {
          margin-bottom: 2rem;
        }
        .settings-group-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          padding-left: 0.5rem;
        }
        .settings-group {
          border-radius: 1.25rem;
          overflow: hidden;
        }
        .settings-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .settings-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .item-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .item-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-icon.security {
          background: rgba(52, 152, 219, 0.1);
          color: #3498db;
        }
        .item-info {
          display: flex;
          flex-direction: column;
        }
        .item-title {
          font-weight: 600;
          font-size: 1rem;
        }
        .item-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .chevron {
          color: var(--text-secondary);
          opacity: 0.5;
        }
        .settings-item-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s ease;
        }
        .settings-item-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .settings-item-btn.danger {
          color: #ff4757;
        }
        .settings-divider {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin: 0;
        }
        .theme-switch-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-radius: 1.25rem;
          cursor: pointer;
        }
        .theme-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .theme-name {
          font-weight: 600;
        }
        .toggle-pill {
          width: 44px;
          height: 24px;
          background: var(--accent);
          border-radius: 100px;
          position: relative;
        }
        .toggle-pill::after {
          content: '';
          position: absolute;
          top: 3px;
          left: ${theme === 'dark' ? '23px' : '3px'};
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  )
}

export default Settings
