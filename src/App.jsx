import React, { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import CreatePact from './pages/CreatePact'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import History from './pages/History'
import Login from './pages/Login'
import ChangePin from './pages/ChangePin'
import useStore from './store/useStore'
import Navbar from './components/Navbar'
import './App.css'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'

// Protected Route Wrapper — defined OUTSIDE App to maintain stable component identity
// If defined inside App, it becomes a new function ref on every render,
// causing React to unmount/remount children (including Dashboard) on every state change.
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated)
  const currentUser = useStore((state) => state.currentUser)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  const currentUser = useStore((state) => state.currentUser)
  const location = useLocation()
  const navigate = useNavigate()
  
  // Get active account data
  const account = useStore((state) => state.accounts[currentUser] || {
    user: { name: '', onboarded: false },
    theme: 'light'
  })
  
  const { user, theme } = account

  const initAuth = useStore((state) => state.initAuth)
  
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  }

  const transition = {
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1] 
  }

  const showNavbar = ['/', '/history', '/analytics', '/settings'].includes(location.pathname);
  const showFAB = ['/', '/history'].includes(location.pathname);

  return (

    <div className="app-shell">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={transition} className="page-wrapper">
                <Dashboard />
              </motion.div>
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute>
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={transition} className="page-wrapper">
                <History />
              </motion.div>
            </ProtectedRoute>
          } />
          
          <Route path="/create-pact" element={
            <ProtectedRoute>
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={transition} className="page-wrapper">
                <CreatePact />
              </motion.div>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={transition} className="page-wrapper">
                <Analytics />
              </motion.div>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={transition} className="page-wrapper">
                <Settings />
              </motion.div>
            </ProtectedRoute>
          } />

          <Route path="/change-pin" element={
            <ProtectedRoute>
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={transition} className="page-wrapper">
                <ChangePin />
              </motion.div>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {showNavbar && <Navbar />}

      {showFAB && (
        <motion.button 
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            useStore.getState().setEditingPact(null);
            navigate('/create-pact');
          }}
          className="floating-add-btn"
        >
          <Plus size={28} />
        </motion.button>
      )}
    </div>
  )
}

export default App
