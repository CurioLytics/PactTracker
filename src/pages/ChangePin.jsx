import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Lock, ArrowLeft, Delete, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChangePin = () => {
  const navigate = useNavigate();
  const { accounts, currentUser, setPassword } = useStore();
  const account = accounts[currentUser];
  
  const [step, setStep] = useState('verify'); // verify, new, confirm
  const [pin, setPin] = useState('');
  const [newPinMatch, setNewPinMatch] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle Physical Keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (success) return;
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
  }, [pin, success]);

  // Handle PIN Logic
  useEffect(() => {
    if (pin.length === 4) {
      if (step === 'verify') {
        if (pin === account.password) {
          setStep('new');
          setPin('');
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      } else if (step === 'new') {
        setNewPinMatch(pin);
        setStep('confirm');
        setPin('');
      } else if (step === 'confirm') {
        if (pin === newPinMatch) {
          const update = async () => {
            const ok = await setPassword(pin);
            if (ok) {
              setSuccess(true);
              setTimeout(() => navigate('/settings'), 1500);
            } else {
              setError(true);
              setPin('');
              setStep('new');
            }
          };
          update();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setStep('new'); // Go back to start of new pin setup
          }, 500);
        }
      }
    }
  }, [pin, step, account?.password, newPinMatch, setPassword, navigate]);

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const getStepTitle = () => {
    if (success) return 'Thành công!';
    switch (step) {
      case 'verify': return 'Xác thực PIN cũ';
      case 'new': return 'Mã PIN mới';
      case 'confirm': return 'Nhập lại PIN mới';
      default: return '';
    }
  };

  const getStepDesc = () => {
    if (success) return 'Mã PIN của bạn đã được cập nhật.';
    switch (step) {
      case 'verify': return 'Vui lòng nhập mã PIN hiện tại để tiếp tục.';
      case 'new': return 'Nhập 4 chữ số cho mã PIN mới của bạn.';
      case 'confirm': return 'Xác nhận lại mã PIN mới một lần nữa.';
      default: return '';
    }
  };

  return (
    <div className="welcome-container">
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2" style={{ background: 'var(--success-color)' }}></div>
      
      <div className="welcome-content" style={{ zIndex: 10 }}>
        <header className="pact-header" style={{ position: 'absolute', top: 20, left: 0, width: '100%', padding: '0 20px', border: 'none', background: 'none' }}>
            <button onClick={() => navigate('/settings')} className="icon-button" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <ArrowLeft size={20} />
            </button>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={step + (success ? 'success' : '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="login-step"
          >
            <div className="badge">
              {success ? <ShieldCheck size={12} /> : <Lock size={12} />}
              <span>{success ? 'Hoàn tất' : 'Bảo mật'}</span>
            </div>
            
            <h1 className="welcome-title">{getStepTitle()}</h1>
            <p className="welcome-quote">{getStepDesc()}</p>

            {success ? (
              <div className="success-lottie-placeholder" style={{ margin: '3rem 0', textAlign: 'center' }}>
                <CheckCircle2 size={80} color="var(--success-color)" style={{ margin: '0 auto' }} />
              </div>
            ) : (
              <>
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
                  <div className="num-btn utility"></div>
                  <button onClick={() => handleNumberClick(0)} className="num-btn">0</button>
                  <button onClick={handleDelete} className="num-btn utility">
                    <Delete size={20} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .login-step {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          text-align: center;
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

export default ChangePin;
