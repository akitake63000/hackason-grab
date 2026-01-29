import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronRight } from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pageTitle: {
    fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
    fontSize: 'clamp(24px, 4vw, 32px)',
    fontWeight: '600',
    color: '#1a3d2e',
    textAlign: 'center',
    marginBottom: '24px',
  },
  introText: {
    fontSize: 'clamp(14px, 2vw, 16px)',
    color: '#7f786d',
    lineHeight: 1.6,
    textAlign: 'center',
    marginBottom: '32px',
  },
  foodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  foodCard: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    cursor: 'pointer',
  },
  foodEmoji: {
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.15) 0%, rgba(201, 169, 98, 0.05) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    flexShrink: 0,
  },
  foodContent: {
    flex: 1,
  },
  foodHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  foodName: {
    fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
    fontSize: 'clamp(16px, 2.5vw, 20px)',
    fontWeight: '600',
    color: '#1a3d2e',
  },
  arrowIcon: {
    color: '#9c958a',
  },
  nutrientTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '10px',
  },
  nutrientTag: {
    padding: '5px 12px',
    background: 'rgba(65, 152, 115, 0.1)',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#1a3d2e',
  },
  foodEffect: {
    fontSize: 'clamp(13px, 1.8vw, 15px)',
    color: '#7f786d',
    lineHeight: 1.6,
  },
  actionSection: {
    maxWidth: '400px',
    margin: '0 auto',
  },
}

const foods = [
  {
    name: '牡蠣',
    emoji: '🦪',
    nutrients: ['亜鉛', 'タンパク質', '鉄'],
    effect: '亜鉛が豊富で、髪の生成に必要な栄養素を効率的に摂取できます。',
  },
  {
    name: '納豆',
    emoji: '🫘',
    nutrients: ['大豆イソフラボン', 'ビタミンK', 'タンパク質'],
    effect: '大豆イソフラボンがホルモンバランスを整え、頭皮環境を改善します。',
  },
  {
    name: '鶏むね肉',
    emoji: '🍗',
    nutrients: ['タンパク質', 'ビタミンB6', 'ナイアシン'],
    effect: '良質なタンパク質が髪の主成分ケラチンの生成をサポートします。',
  },
  {
    name: '卵',
    emoji: '🥚',
    nutrients: ['ビオチン', 'タンパク質', '亜鉛'],
    effect: 'ビオチンが髪の成長を促進し、ツヤとハリを与えます。',
  },
  {
    name: '青魚（サバ・イワシ）',
    emoji: '🐟',
    nutrients: ['オメガ3', 'DHA', 'EPA'],
    effect: 'オメガ3脂肪酸が頭皮の血行を促進し、健康な髪の成長を助けます。',
  },
]

function FoodRecommend() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <motion.h1
          style={styles.pageTitle}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          おすすめ食材
        </motion.h1>

        <motion.p
          style={styles.introText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          あなたの傾向分析結果に基づき、<br />
          育毛に効果的な食材をおすすめします
        </motion.p>

        <div style={styles.foodGrid}>
          {foods.map((food, index) => (
            <Card
              key={food.name}
              padding="lg"
              hoverable
              delay={0.15 + index * 0.08}
            >
              <div style={styles.foodCard}>
                <motion.div
                  style={styles.foodEmoji}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {food.emoji}
                </motion.div>
                <div style={styles.foodContent}>
                  <div style={styles.foodHeader}>
                    <span style={styles.foodName}>{food.name}</span>
                    <ChevronRight size={20} style={styles.arrowIcon} />
                  </div>
                  <div style={styles.nutrientTags}>
                    {food.nutrients.map((nutrient) => (
                      <span key={nutrient} style={styles.nutrientTag}>
                        {nutrient}
                      </span>
                    ))}
                  </div>
                  <p style={styles.foodEffect}>{food.effect}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={styles.actionSection}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              size="full"
              variant="accent"
              icon={<MapPin size={18} />}
              onClick={() => navigate('/feature3/nearby-stores')}
            >
              近くの店舗を探す
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default FoodRecommend
