import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Lock, ChevronRight, Delete, UserPlus, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { 
    accounts, 
    currentUser, 
    setCurrentUser, 
    login, 
    signup, 
    setPassword, 
    setUser, 
    isAuthenticated
  } = useStore();
  
  const [usernameInput, setUsernameInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('username'); // username, pin-entry, pin-setup, signup-name

  // Account for current username
  const account = accounts[usernameInput || currentUser];
  const isExistingUser = !!account;

  useEffect(() => {
    if (currentUser && !isAuthenticated) {
      setMode('pin-entry');
    }
  }, [currentUser, isAuthenticated]);

  const handleUsernameSubmit = (e) => {
    if (e) e.preventDefault();
    if (!usernameInput.trim()) return;
    
    const lowerUsername = usernameInput.toLowerCase().trim();
    if (accounts[lowerUsername]) {
      setCurrentUser(lowerUsername);
      setMode('pin-entry');
    } else {
      setMode('signup-name');
    }
  };

  const handleSignupNameSubmit = () => {
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      setNameError('Vui lòng nhập tên của bạn');
      return;
    }
    const lowerUsername = usernameInput.toLowerCase().trim();
    // Double-check: username must not already exist (guard against race condition)
    if (accounts[lowerUsername]) {
      setNameError('Username này đã tồn tại. Vui lòng chọn tên khác.');
      return;
    }
    setNameError('');
    setIsLoading(true);
    const success = await signup(lowerUsername, trimmedName);
    setIsLoading(false);
    if (success) {
      setMode('pin-setup');
    } else {
      setNameError('Không thể tạo tài khoản. Vui lòng thử lại.');
    }
  };

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only listen if we are in a PIN mode
      if (mode !== 'pin-entry' && mode !== 'pin-setup') return;

      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 4) {
          setPin(prev => prev + e.key);
          setError(false);
        }
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, pin]);

  useEffect(() => {
    if (pin.length === 4) {
      if (mode === 'pin-setup') {
        const finalize = async () => {
          setIsLoading(true);
          const success = await setPassword(pin);
          if (success) {
            await setUser({ onboarded: true });
            navigate('/create-pact');
          } else {
            setError(true);
            setPin('');
          }
          setIsLoading(false);
        };
        finalize();
      } else if (mode === 'pin-entry') {
        const attemptLogin = async () => {
          setIsLoading(true);
          const success = await login(currentUser, pin);
          if (!success) {
            setError(true);
            setTimeout(() => setPin(''), 500);
          } else {
            navigate('/');
          }
          setIsLoading(false);
        };
        attemptLogin();
      }
    }
  }, [pin, mode, setPassword, login, setUser, currentUser, navigate]);

  return (
    <div className="welcome-container">
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      
      <div className="welcome-content" style={{ zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {mode === 'username' && (
            <motion.div 
              key="username"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="login-step"
            >
              <div className="pact-logo-container" style={{ marginBottom: '2rem' }}>
                <div className="pact-logo" style={{ fontSize: '3.5rem' }}>
                  PACT<span className="text-secondary">.</span>
                </div>
              </div>
              <h1 className="welcome-title">Chào mừng</h1>
              <p className="welcome-quote">Nhập tên đăng nhập của bạn để tiếp tục.</p>
              
              <form onSubmit={handleUsernameSubmit} className="welcome-input-group" style={{ marginBottom: '2rem' }}>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Username (ví dụ: alex)"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="welcome-input"
                />
                <button type="submit" className="welcome-btn-icon">
                  <ChevronRight size={24} />
                </button>
              </form>

              {Object.keys(accounts).length > 0 && (
                <div className="existing-accounts">
                  <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '1rem' }}>Tài khoản hiện có</p>
                  <div className="accounts-list">
                    {Object.keys(accounts).map(userAcc => (
                      <button 
                        key={userAcc}
                        onClick={() => {
                          setUsernameInput(userAcc);
                          setCurrentUser(userAcc);
                          setMode('pin-entry');
                        }}
                        className="account-chip"
                      >
                        <Users size={14} />
                        <span>{userAcc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {mode === 'signup-name' && (
            <motion.div 
              key="signup-name"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="login-step"
            >
              <div className="badge">
                <UserPlus size={12} />
                <span>Tài khoản mới: @{usernameInput.toLowerCase().trim()}</span>
              </div>
              <h1 className="welcome-title">Bạn tên là gì?</h1>
              <p className="welcome-quote">Tên này sẽ hiển thị trong các thử nghiệm của bạn.</p>
              
              <div className="welcome-input-group">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Tên của bạn"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  className={`welcome-input ${nameError ? 'input-error' : ''}`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSignupNameSubmit();
                  }}
                />
                <button 
                  onClick={handleSignupNameSubmit}
                  className="welcome-btn-icon"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              {nameError && (
                <p className="input-error-msg">{nameError}</p>
              )}
              <button onClick={() => { setMode('username'); setNameInput(''); setNameError(''); }} className="text-btn">Quay lại</button>
            </motion.div>
          )}

          {(mode === 'pin-entry' || mode === 'pin-setup') && (
            <motion.div 
              key="pin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="login-step"
            >
              <div className="badge">
                <Lock size={12} />
                <span>{mode === 'pin-setup' ? 'Bước cuối: Bảo mật' : 'Nhập mã PIN'}</span>
              </div>
              
              <h1 className="welcome-title">
                {mode === 'pin-setup' ? 'Thiết lập PIN' : `Chào ${accounts[currentUser]?.user?.name || currentUser}`}
              </h1>
              
              <p className="welcome-quote">
                {mode === 'pin-setup' 
                  ? 'Tạo mã PIN 4 số để bảo vệ kho dữ liệu của bạn.' 
                  : 'Vui lòng nhập mã PIN để xác thực.'}
              </p>

              <div className={`pin-display ${error ? 'error-shake' : ''}`}>
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`pin-dot ${pin.length > i ? 'active' : ''}`}
                  />
                ))}
              </div>

              <div className="numpad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button key={num} onClick={() => handleNumberClick(num)} className="num-btn">
                    {num}
                  </button>
                ))}
                <button onClick={() => {
                  setMode('username');
                  setCurrentUser(null);
                  setPin('');
                }} className="num-btn utility" style={{ fontSize: '0.9rem' }}>Đổi User</button>
                <button onClick={() => handleNumberClick(0)} className="num-btn">0</button>
                <button onClick={handleDelete} className="num-btn utility">
                  <Delete size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .login-step {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .account-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          color: var(--text-primary);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .account-chip:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
          border-color: var(--accent);
        }

        .text-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          margin-top: 2rem;
          cursor: pointer;
          font-size: 0.9rem;
          text-decoration: underline;
        }

        .input-error {
          border-bottom-color: var(--error, #e74c3c) !important;
        }

        .input-error-msg {
          color: var(--error, #e74c3c);
          font-size: 0.8rem;
          margin-top: -0.5rem;
          margin-bottom: 1rem;
          text-align: left;
        }

        .pin-display {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          margin: 2rem 0 3rem 0;
        }
        
        .pin-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid var(--glass-border);
          transition: all 0.2s ease;
        }
        
        .pin-dot.active {
          background: var(--accent);
          border-color: var(--accent);
          transform: scale(1.2);
          box-shadow: 0 0 10px var(--accent);
        }
        
        .numpad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          max-width: 300px;
          margin: 0 auto;
        }
        
        .num-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        
        .num-btn:active {
          background: var(--accent);
          color: white;
          transform: scale(0.9);
        }
        
        .num-btn.utility {
          background: transparent;
          border: none;
          color: var(--text-secondary);
        }
        
        .error-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
