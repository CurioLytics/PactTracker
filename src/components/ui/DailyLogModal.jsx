import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, AlertTriangle, ArrowRight } from 'lucide-react';

/**
 * DailyLogModal
 * mode="log"  – shown after completing a pact (optional log entry)
 * mode="undo" – shown before undoing (warns if a log exists for today)
 */
const DailyLogModal = ({ isOpen, mode, existingLog, onSubmitLog, onConfirmUndo, onClose }) => {
  const [whatWorked, setWhatWorked] = useState(existingLog?.whatWorked || '');
  const [whatDidntWork, setWhatDidntWork] = useState(existingLog?.whatDidntWork || '');
  const [whatNext, setWhatNext] = useState(existingLog?.whatNext || '');

  const handleSkip = () => onClose();

  const handleSave = () => {
    const hasContent = whatWorked.trim() || whatDidntWork.trim() || whatNext.trim();
    if (hasContent) {
      onSubmitLog({ whatWorked: whatWorked.trim(), whatDidntWork: whatDidntWork.trim(), whatNext: whatNext.trim() });
    }
    onClose();
  };

  const handleUndo = () => {
    onConfirmUndo();
    onClose();
  };

  return (
    <>
      {/* Backdrop — AnimatePresence with direct keyed motion.div */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dlm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={mode === 'log' ? handleSkip : onClose}
            className="dlm-backdrop"
          />
        )}
      </AnimatePresence>

      {/* Sheet wrapper — AnimatePresence separate from backdrop */}
      <AnimatePresence>
        {isOpen && (
          <div className="dlm-wrapper" key="dlm-outer">
            <motion.div
              key="dlm-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 380 }}
              className="dlm-sheet glass"
            >
              {/* Drag handle */}
              <div className="dlm-handle" />

              {mode === 'log' ? (
                <>
                  <div className="dlm-header">
                    <div className="dlm-title-group">
                      <div className="dlm-icon-badge">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <h3 className="dlm-title">Nhật ký hôm nay</h3>
                      </div>
                    </div>
                    <button className="dlm-close-btn" onClick={handleSkip}>
                      <X size={20} />
                    </button>
                  </div>

                  <div className="dlm-fields">
                    <div className="dlm-field">
                      <label className="dlm-field-label">
                        <span className="dlm-dot dot-green" />
                        Điều đã hiệu quả
                      </label>
                      <textarea
                        className="dlm-textarea"
                        placeholder="Hôm nay bạn làm tốt điều gì?"
                        value={whatWorked}
                        onChange={e => setWhatWorked(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="dlm-field">
                      <label className="dlm-field-label">
                        <span className="dlm-dot dot-orange" />
                        Điều chưa hiệu quả
                      </label>
                      <textarea
                        className="dlm-textarea"
                        placeholder="Điều gì cần cải thiện?"
                        value={whatDidntWork}
                        onChange={e => setWhatDidntWork(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="dlm-field">
                      <label className="dlm-field-label">
                        <span className="dlm-dot dot-blue" />
                        Bước tiếp theo
                      </label>
                      <textarea
                        className="dlm-textarea"
                        placeholder="Ngày mai bạn sẽ thử gì?"
                        value={whatNext}
                        onChange={e => setWhatNext(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="dlm-actions">
                    <button className="dlm-skip-btn" onClick={handleSkip}>Bỏ qua</button>
                    <button className="dlm-save-btn" onClick={handleSave}>
                      Lưu nhật ký
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              ) : (
                /* Undo confirmation mode */
                <>
                  <div className="dlm-header">
                    <div className="dlm-title-group">
                      <div className="dlm-icon-badge dlm-badge-warn">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <h3 className="dlm-title">Bạn chưa làm hôm nay?</h3>
                        <p className="dlm-subtitle">Hành động hoàn thành sẽ bị hủy</p>
                      </div>
                    </div>
                  </div>

                  {existingLog && (
                    <div className="dlm-warn-box">
                      <AlertTriangle size={14} style={{ color: '#f39c12', flexShrink: 0, marginTop: 2 }} />
                      <p className="dlm-warn-text">
                        Nhật ký hôm nay của bạn sẽ bị <strong>xóa</strong> cùng với lần hoàn thành này.
                      </p>
                    </div>
                  )}

                  <div className="dlm-actions">
                    <button className="dlm-skip-btn" onClick={onClose}>Hủy</button>
                    <button className="dlm-undo-btn" onClick={handleUndo}>
                      Xác nhận
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .dlm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          z-index: 1001;
        }

        .dlm-wrapper {
          position: fixed;
          inset: 0;
          z-index: 1002;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          pointer-events: none;
          padding-bottom: 72px;
        }

        .dlm-sheet {
          pointer-events: all;
          width: 100%;
          max-width: 600px;
          border-radius: 28px 28px 0 0;
          padding: 1.25rem 1.5rem 2rem;
          background: var(--bg-primary);
          border: 1px solid var(--glass-border);
          border-bottom: none;
          box-sizing: border-box;
        }

        .dlm-handle {
          width: 40px;
          height: 4px;
          border-radius: 2px;
          background: var(--glass-border);
          margin: 0 auto 1.25rem;
        }

        .dlm-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        .dlm-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dlm-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(var(--accent-rgb), 0.12);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dlm-badge-warn {
          background: rgba(243, 156, 18, 0.12);
          color: #f39c12;
        }

        .dlm-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.2rem;
        }

        .dlm-subtitle {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .dlm-close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          flex-shrink: 0;
        }

        .dlm-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .dlm-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .dlm-field-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .dlm-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-green  { background: #2ecc71; }
        .dot-orange { background: #f39c12; }
        .dot-blue   { background: var(--accent); }

        .dlm-textarea {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--text-primary);
          resize: none;
          line-height: 1.5;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .dlm-textarea:focus {
          outline: none;
          border-color: var(--accent);
          background: rgba(var(--accent-rgb), 0.04);
        }
        .dlm-textarea::placeholder {
          color: var(--text-tertiary);
        }

        .dlm-actions {
          display: flex;
          gap: 0.75rem;
        }

        .dlm-skip-btn {
          flex: 1;
          padding: 0.9rem;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dlm-skip-btn:hover { background: var(--bg-secondary); }

        .dlm-save-btn {
          flex: 2;
          padding: 0.9rem;
          border-radius: 12px;
          border: none;
          background: var(--accent);
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .dlm-save-btn:hover { filter: brightness(1.1); }

        .dlm-undo-btn {
          flex: 2;
          padding: 0.9rem;
          border-radius: 12px;
          border: none;
          background: rgba(231, 76, 60, 0.12);
          color: #e74c3c;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dlm-undo-btn:hover { background: rgba(231, 76, 60, 0.22); }

        .dlm-warn-box {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          background: rgba(243, 156, 18, 0.06);
          border: 1px solid rgba(243, 156, 18, 0.2);
        }

        .dlm-warn-text {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }
      `}</style>
    </>
  );
};

export default DailyLogModal;
