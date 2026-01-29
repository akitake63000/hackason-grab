import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LogIn, User, Home as HomeIcon, Settings,
  Camera, BarChart3, FileText, Activity,
  MessageCircle, Users, Sliders,
  TrendingUp, UtensilsCrossed, Apple, Dumbbell, MapPin
} from 'lucide-react'

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(165deg, #d4f0e3 0%, #f8f6f2 30%, #ebe8e3 100%)',
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '60%',
    height: '50%',
    background: 'radial-gradient(ellipse at center, rgba(65, 152, 115, 0.15) 0%, transparent 70%)',
    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-20%',
    width: '50%',
    height: '40%',
    background: 'radial-gradient(ellipse at center, rgba(201, 169, 98, 0.1) 0%, transparent 60%)',
    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
    pointerEvents: 'none',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  logoContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #1a3d2e 0%, #347a5c 100%)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    boxShadow: '0 4px 14px rgba(26, 61, 46, 0.25)',
  },
  title: {
    fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
    fontSize: '36px',
    fontWeight: '600',
    color: '#1a3d2e',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '14px',
    color: '#7f786d',
    marginTop: '8px',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginTop: '32px',
    flexWrap: 'wrap',
  },
  statItem: {
    textAlign: 'center',
  },
  statValue: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '40px',
    fontWeight: '600',
    color: '#1a3d2e',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '12px',
    color: '#7f786d',
    marginTop: '4px',
  },
  section: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    boxShadow: '0 10px 40px rgba(26, 61, 46, 0.06)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  sectionIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIconCommon: {
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    color: '#1565c0',
  },
  sectionIconFeature1: {
    background: 'linear-gradient(135deg, #d4f0e3 0%, #a8dcc5 100%)',
    color: '#1a3d2e',
  },
  sectionIconFeature2: {
    background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
    color: '#e65100',
  },
  sectionIconFeature3: {
    background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
    color: '#c2185b',
  },
  sectionTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a3d2e',
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: '#7f786d',
    marginTop: '2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  card: {
    background: 'rgba(248, 246, 242, 0.8)',
    borderRadius: '16px',
    padding: '16px',
    cursor: 'pointer',
    border: '1.5px solid transparent',
    transition: 'all 0.3s ease',
  },
  cardId: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#419873',
    marginBottom: '4px',
    letterSpacing: '0.02em',
  },
  cardName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a3d2e',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardDesc: {
    fontSize: '12px',
    color: '#7f786d',
    lineHeight: 1.4,
  },
  footer: {
    textAlign: 'center',
    marginTop: '48px',
    color: '#9c958a',
    fontSize: '13px',
  },
}

const screens = {
  common: [
    { id: 'SCR-00-01', name: 'ログイン', desc: 'Googleアカウントでログイン', path: '/login', icon: LogIn },
    { id: 'SCR-00-02', name: 'プロフィール設定', desc: '性別・年齢・悩みを登録', path: '/profile', icon: User },
    { id: 'SCR-00-03', name: 'ホーム', desc: '3機能への導線・サマリー', path: '/home', icon: HomeIcon },
    { id: 'SCR-00-04', name: '設定', desc: '通知・プライバシー・ログアウト', path: '/settings', icon: Settings },
  ],
  feature1: [
    { id: 'SCR-01-01', name: '撮影ガイド＆撮影', desc: 'AIガイドで頭部を撮影', path: '/feature1/capture', icon: Camera },
    { id: 'SCR-01-02', name: '解析結果', desc: '髪密度・薄毛タイプ判定', path: '/feature1/result', icon: Activity },
    { id: 'SCR-01-03', name: 'ダッシュボード', desc: '時系列データの可視化', path: '/feature1/dashboard', icon: BarChart3 },
    { id: 'SCR-01-04', name: 'レポート詳細', desc: 'AI生成の自然言語レポート', path: '/feature1/report', icon: FileText },
  ],
  feature2: [
    { id: 'SCR-02-01', name: 'チャット', desc: 'AIチャットボットとの対話', path: '/feature2/chat', icon: MessageCircle },
    { id: 'SCR-02-02', name: 'チーム会議モード', desc: '3視点からのアドバイス', path: '/feature2/team-meeting', icon: Users },
    { id: 'SCR-02-03', name: 'チャット設定', desc: '対応スタイルの調整', path: '/feature2/settings', icon: Sliders },
  ],
  feature3: [
    { id: 'SCR-03-01', name: '傾向分析結果', desc: '遺伝性/栄養/ストレス等のスコア', path: '/feature3/tendency', icon: TrendingUp },
    { id: 'SCR-03-02', name: '食事撮影＆栄養分析', desc: '食事写真から栄養素を分析', path: '/feature3/meal', icon: UtensilsCrossed },
    { id: 'SCR-03-03', name: '食材レコメンド', desc: 'おすすめ食材一覧', path: '/feature3/food-recommend', icon: Apple },
    { id: 'SCR-03-04', name: '運動レコメンド', desc: 'おすすめ運動一覧', path: '/feature3/exercise-recommend', icon: Dumbbell },
    { id: 'SCR-03-05', name: '近くの店舗', desc: '地図で店舗を表示', path: '/feature3/nearby-stores', icon: MapPin },
  ],
}

function Index() {
  const navigate = useNavigate()

  const ScreenCard = ({ screen, delay }) => {
    const Icon = screen.icon
    return (
      <motion.div
        style={styles.card}
        onClick={() => navigate(screen.path)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{
          y: -4,
          borderColor: '#419873',
          boxShadow: '0 8px 24px rgba(26, 61, 46, 0.12)',
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div style={styles.cardId}>{screen.id}</div>
        <div style={styles.cardName}>
          <Icon size={16} />
          {screen.name}
        </div>
        <div style={styles.cardDesc}>{screen.desc}</div>
      </motion.div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.content}>
        {/* Header */}
        <motion.header
          style={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>🌿</div>
            <h1 style={styles.title}>薄毛対策AIエージェント</h1>
          </div>
          <p style={styles.subtitle}>
            Google Cloud Japan AI Hackathon Vol.4 - React モック
          </p>

          <div style={styles.stats}>
            <motion.div
              style={styles.statItem}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div style={styles.statValue}>16</div>
              <div style={styles.statLabel}>画面数</div>
            </motion.div>
            <motion.div
              style={styles.statItem}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div style={styles.statValue}>46</div>
              <div style={styles.statLabel}>機能数</div>
            </motion.div>
            <motion.div
              style={styles.statItem}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div style={styles.statValue}>13</div>
              <div style={styles.statLabel}>ADKツール数</div>
            </motion.div>
          </div>
        </motion.header>

        {/* Common Screens */}
        <motion.section
          style={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={styles.sectionHeader}>
            <div style={{ ...styles.sectionIcon, ...styles.sectionIconCommon }}>
              <HomeIcon size={22} />
            </div>
            <div>
              <h2 style={styles.sectionTitle}>共通画面（FNC-00）</h2>
              <p style={styles.sectionSubtitle}>ログイン・ホーム・設定</p>
            </div>
          </div>
          <div style={styles.grid}>
            {screens.common.map((screen, i) => (
              <ScreenCard key={screen.id} screen={screen} delay={0.3 + i * 0.05} />
            ))}
          </div>
        </motion.section>

        {/* Feature 1 */}
        <motion.section
          style={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div style={styles.sectionHeader}>
            <div style={{ ...styles.sectionIcon, ...styles.sectionIconFeature1 }}>
              <Camera size={22} />
            </div>
            <div>
              <h2 style={styles.sectionTitle}>機能1: 生え際・髪密度AIチェック（FNC-01）</h2>
              <p style={styles.sectionSubtitle}>Gemini Visionで頭部画像を解析</p>
            </div>
          </div>
          <div style={styles.grid}>
            {screens.feature1.map((screen, i) => (
              <ScreenCard key={screen.id} screen={screen} delay={0.4 + i * 0.05} />
            ))}
          </div>
        </motion.section>

        {/* Feature 2 */}
        <motion.section
          style={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div style={styles.sectionHeader}>
            <div style={{ ...styles.sectionIcon, ...styles.sectionIconFeature2 }}>
              <MessageCircle size={22} />
            </div>
            <div>
              <h2 style={styles.sectionTitle}>機能2: 髪のお悩み相談チャットボット（FNC-02）</h2>
              <p style={styles.sectionSubtitle}>ニーズ分析＋3視点チーム会議</p>
            </div>
          </div>
          <div style={styles.grid}>
            {screens.feature2.map((screen, i) => (
              <ScreenCard key={screen.id} screen={screen} delay={0.5 + i * 0.05} />
            ))}
          </div>
        </motion.section>

        {/* Feature 3 */}
        <motion.section
          style={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div style={styles.sectionHeader}>
            <div style={{ ...styles.sectionIcon, ...styles.sectionIconFeature3 }}>
              <Apple size={22} />
            </div>
            <div>
              <h2 style={styles.sectionTitle}>機能3: 育毛サポート生活アドバイザー（FNC-03）</h2>
              <p style={styles.sectionSubtitle}>傾向分析・食事記録・レコメンド</p>
            </div>
          </div>
          <div style={styles.grid}>
            {screens.feature3.map((screen, i) => (
              <ScreenCard key={screen.id} screen={screen} delay={0.6 + i * 0.05} />
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>薄毛対策AIエージェント - Phase 1 React モック</p>
          <p>バージョン 2.0 | 2026-01-29</p>
        </footer>
      </div>
    </div>
  )
}

export default Index
