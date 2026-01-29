import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Camera, MessageCircle, Leaf, Settings } from 'lucide-react'

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '12px 16px 8px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(26, 61, 46, 0.06)',
    position: 'relative',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  navItemActive: {
    background: 'rgba(65, 152, 115, 0.1)',
  },
  iconWrapper: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: '10px',
    fontWeight: '500',
    color: '#7f786d',
    transition: 'color 0.3s ease',
  },
  labelActive: {
    color: '#1a3d2e',
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    top: '4px',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#c9a962',
  },
}

const navItems = [
  { id: 'home', icon: Home, label: 'ホーム', path: '/home' },
  { id: 'feature1', icon: Camera, label: 'AIチェック', path: '/feature1/capture' },
  { id: 'feature2', icon: MessageCircle, label: '相談', path: '/feature2/chat' },
  { id: 'feature3', icon: Leaf, label: '生活', path: '/feature3/tendency' },
  { id: 'settings', icon: Settings, label: '設定', path: '/settings' },
]

function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (item) => {
    if (item.id === 'home') return location.pathname === '/home'
    if (item.id === 'settings') return location.pathname === '/settings'
    return location.pathname.startsWith(`/${item.id}`)
  }

  return (
    <nav style={styles.nav}>
      {navItems.map((item) => {
        const active = isActive(item)
        const Icon = item.icon

        return (
          <motion.button
            key={item.id}
            style={{
              ...styles.navItem,
              ...(active ? styles.navItemActive : {}),
            }}
            onClick={() => navigate(item.path)}
            whileTap={{ scale: 0.95 }}
          >
            {active && (
              <motion.div
                style={styles.indicator}
                layoutId="navIndicator"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <div style={styles.iconWrapper}>
              <Icon
                size={22}
                color={active ? '#1a3d2e' : '#9c958a'}
                strokeWidth={active ? 2.5 : 2}
              />
            </div>
            <span style={{
              ...styles.label,
              ...(active ? styles.labelActive : {}),
            }}>
              {item.label}
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}

export default BottomNav
