export default function Loading() {
  return (
    <>
      <div className="survey-header">
        <div className="brand-eyebrow">Waveboard — Internal</div>
        <div className="survey-title">Response Dashboard</div>
        <div className="survey-subtitle">Loading statistics…</div>
      </div>
      <div className="stats-container">
        <div
          className="stat-card"
          style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-muted)',
            fontSize: 14,
          }}
        >
          Loading…
        </div>
      </div>
    </>
  )
}
