import PageShell from "./ui/PageShell";
import styles from "./page.module.css";

export default function Home() {
  return (
    <PageShell
      title="HairGuard Agent"
      description="薄毛対策の継続を支える、進捗トラッキングとエージェント介入のMVP。"
      badge="MVP: skeleton"
    >
      <section className={styles.hero}>
        <p className={styles.heroText}>
          週1回のチェックインを「数値」と「言葉」で支える、介入型の習慣化エージェント。
        </p>
        <div className={styles.ctas}>
          <a className={styles.ctaPrimary} href="/login">
            はじめる（ログイン）
          </a>
          <a className={styles.ctaSecondary} href="/checkin">
            写真チェックインへ
          </a>
        </div>
      </section>

      <section className={styles.section}>
        <h2>今日の3ステップ</h2>
        <ol className={styles.stepList}>
          <li>ログインして撮影条件を確認</li>
          <li>写真アップロードで密度指数を計測</li>
          <li>週次レポートで次の一手を決める</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>主な機能</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <h3>Check-in</h3>
            <p>同条件の写真で密度指数を更新。</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Dashboard</h3>
            <p>推移を見える化して継続の根拠を作る。</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Mental Shield</h3>
            <p>3人格が短く支えて、最小の一手を提示。</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Food Sniper</h3>
            <p>帰り道で買うべき食材を提案。</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
