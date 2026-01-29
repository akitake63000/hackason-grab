import { motion } from 'framer-motion'

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    position: 'relative',
    zIndex: 1,
  },
  frame: {
    width: '100%',
    maxWidth: '430px',
    height: '932px',
    maxHeight: '95vh',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8f6f2 100%)',
    borderRadius: '44px',
    boxShadow: `
      0 50px 100px rgba(26, 61, 46, 0.15),
      0 20px 60px rgba(26, 61, 46, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.8),
      inset 0 -1px 0 rgba(0, 0, 0, 0.05)
    `,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  notch: {
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '126px',
    height: '34px',
    background: '#000',
    borderRadius: '0 0 20px 20px',
    zIndex: 100,
  },
  statusBar: {
    height: '54px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: '0 28px 8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1815',
    flexShrink: 0,
  },
  time: {
    marginLeft: '4px',
  },
  statusIcons: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  homeIndicator: {
    height: '34px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  indicator: {
    width: '134px',
    height: '5px',
    background: '#1a1815',
    borderRadius: '100px',
  },
}

function PhoneFrame({ children, hideStatusBar = false, hideHomeIndicator = false }) {
  const now = new Date()
  const time = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={styles.wrapper}>
      <motion.div
        style={styles.frame}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Dynamic Island / Notch */}
        <div style={styles.notch} />

        {/* Status Bar */}
        {!hideStatusBar && (
          <div style={styles.statusBar}>
            <span style={styles.time}>{time}</span>
            <div style={styles.statusIcons}>
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                <path d="M1 4.5C2.5 2.5 5 1 9 1s6.5 1.5 8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M3 7C4 5.5 6 4.5 9 4.5s5 1 6 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
              </svg>
              <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                <rect x="0.5" y="0.5" width="3" height="11" rx="1" stroke="currentColor"/>
                <rect x="4.5" y="3" width="3" height="8.5" rx="1" fill="currentColor"/>
                <rect x="8.5" y="5" width="3" height="6.5" rx="1" fill="currentColor"/>
                <rect x="12.5" y="7" width="3" height="4.5" rx="1" fill="currentColor"/>
              </svg>
              <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor"/>
                <rect x="22" y="3.5" width="2" height="5" rx="1" fill="currentColor"/>
                <rect x="2" y="2" width="17" height="8" rx="1.5" fill="#419873"/>
              </svg>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div style={styles.content}>
          {children}
        </div>

        {/* Home Indicator */}
        {!hideHomeIndicator && (
          <div style={styles.homeIndicator}>
            <div style={styles.indicator} />
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default PhoneFrame
