'use client';
import styles from './MannerTemperature.module.css';

const getGrade = (score: number) => {
  if (score <= 20) return { label: '나쁨', color: '#ef4444' };
  if (score <= 40) return { label: '약간나쁨', color: '#f97316' };
  if (score <= 60) return { label: '보통', color: '#eab308' };
  if (score <= 80) return { label: '좋음', color: '#22c55e' };
  return { label: '최고', color: '#3b82f6' };
};

export default function MannerTemperature({ score }: { score: number }) {
  const { label, color } = getGrade(score);
  const percent = Math.max(0, Math.min(100, score));
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.score} style={{ color }}>{score}점</span>
        <span className={styles.grade} style={{ color }}>{label}</span>
      </div>
      <div className={styles.barBg}>
        <div className={styles.barFill} style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
      <div className={styles.axis}><span>0</span><span>50</span><span>100</span></div>
    </div>
  );
}