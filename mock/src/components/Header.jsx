import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Settings, MoreVertical } from 'lucide-react'

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: 'transparent',
    position: 'relative',
    zIndex: 10,
  },
  headerGlass: {
    background: 'rgba(248, 246, 242, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
  },
  backButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(26, 61, 46, 0.08)',
    borderRadius: '12px',
    cursor: 'pointer',
    color: '#1a3d2e',
    transition: 'all 0.2s ease',
  },
  titleContainer: {
    flex: 1,
    textAlign: 'center',
    padding: '0 12px',
  },
  title: {
    fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a3d2e',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#7f786d',
    marginTop: '2px',
  },
  actionButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    color: '#635d54',
    transition: 'all 0.2s ease',
  },
  placeholder: {
    width: '40px',
    height: '40px',
  },
}

function Header({
  title,
  subtitle,
  showBack = false,
  backTo,
  rightAction,
  rightIcon,
  glass = false
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  return (
    <motion.header
      style={{ ...styles.header, ...(glass ? styles.headerGlass : {}) }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {showBack ? (
        <motion.button
          style={styles.backButton}
          onClick={handleBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={20} />
        </motion.button>
      ) : (
        <div style={styles.placeholder} />
      )}

      <div style={styles.titleContainer}>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>

      {rightAction ? (
        <motion.button
          style={styles.actionButton}
          onClick={rightAction}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {rightIcon || <MoreVertical size={20} />}
        </motion.button>
      ) : (
        <div style={styles.placeholder} />
      )}
    </motion.header>
  )
}

export default Header
