import { getStats } from '@/lib/db'
import { DeleteButton, ClearAllButton } from './delete-buttons'

function BarChart({ data, labelKey }: { data: Record<string, string | number>[]; labelKey: string }) {
  const maxCount = Math.max(...data.map((d) => Number(d.count)), 1)
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div key={String(d[labelKey])} className="bar-row">
          <span className="bar-label">{String(d[labelKey])}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(Number(d.count) / maxCount) * 100}%` }} />
          </div>
          <span className="bar-count">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

function AvgCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="avg-item">
      <div className="avg-value">{value ?? '—'}</div>
      <div className="avg-label">{label}</div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default async function WaveboardPage() {
  let stats: Awaited<ReturnType<typeof getStats>> | null = null
  let error: string | null = null

  try {
    stats = await getStats()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load statistics'
  }

  return (
    <>
      <div className="survey-header">
        <div className="brand-eyebrow">Waveboard — Internal</div>
        <div className="survey-title">Response Dashboard</div>
        <div className="survey-subtitle">
          {stats ? `${stats.total} response${stats.total === 1 ? '' : 's'} collected` : 'Statistics'}
        </div>
      </div>

      <div className="stats-container">
        {stats && stats.total > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <ClearAllButton />
          </div>
        )}
        {error ? (
          <div className="stat-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--signal)', fontWeight: 500 }}>Could not load data</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
              {error}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
              Make sure <code style={{ background: 'var(--stone)', padding: '2px 6px', borderRadius: 4 }}>.env</code> has a valid <code style={{ background: 'var(--stone)', padding: '2px 6px', borderRadius: 4 }}>DATABASE_URL</code> and the <code style={{ background: 'var(--stone)', padding: '2px 6px', borderRadius: 4 }}>responses</code> table exists.
            </p>
          </div>
        ) : stats && stats.total === 0 ? (
          <div className="stat-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No responses yet.</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Share the survey link to start collecting feedback.</p>
          </div>
        ) : stats ? (
          <>
            {/* Summary Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Responses</h3>
                <div className="stat-number">{stats.total}</div>
              </div>
              <div className="stat-card">
                <h3>Average Likelihood</h3>
                <div className="stat-number">{stats.averages.avg_likelihood ?? '—'}</div>
              </div>
              <div className="stat-card">
                <h3>Average Intensity Match</h3>
                <div className="stat-number">{stats.averages.avg_intensity ?? '—'}</div>
              </div>
              <div className="stat-card">
                <h3>Average Ease of Use</h3>
                <div className="stat-number">{stats.averages.avg_ease ?? '—'}</div>
              </div>
            </div>

            {/* Average Scores */}
            <div className="stat-card" style={{ marginBottom: 24 }}>
              <h3>Average Scores (1-5)</h3>
              <div className="avg-scores">
                <AvgCard label="Intensity Match" value={stats.averages.avg_intensity} />
                <AvgCard label="Movement Cues" value={stats.averages.avg_cues} />
                <AvgCard label="App Ease of Use" value={stats.averages.avg_ease} />
                <AvgCard label="Likelihood to Reuse" value={stats.averages.avg_likelihood} />
              </div>
            </div>

            {/* Sport Distribution */}
            <div className="stat-card" style={{ marginBottom: 24 }}>
              <h3>Sports &amp; Activities</h3>
              <BarChart data={stats.sportDistribution} labelKey="sport" />
            </div>

            {/* Routine Distribution */}
            <div className="stat-card" style={{ marginBottom: 24 }}>
              <h3>Routine Selection</h3>
              <BarChart data={stats.routineDistribution} labelKey="routine" />
            </div>

            {/* Science Clarity */}
            <div className="stat-card" style={{ marginBottom: 24 }}>
              <h3>Science Clarity</h3>
              <BarChart data={stats.scienceClarity} labelKey="science_clarity" />
            </div>

            {/* Best Feature */}
            {stats.bestFeature.length > 0 && (
              <div className="stat-card" style={{ marginBottom: 24 }}>
                <h3>Most Useful Part</h3>
                <BarChart data={stats.bestFeature} labelKey="best_feature" />
              </div>
            )}

            {/* Discomfort */}
            {stats.discomfortDistribution.length > 0 && (
              <div className="stat-card" style={{ marginBottom: 24 }}>
                <h3>Discomfort Reported</h3>
                <BarChart data={stats.discomfortDistribution} labelKey="value" />
              </div>
            )}

            {/* Recent Responses */}
            <div className="stat-card" style={{ marginBottom: 24 }}>
              <h3>Recent Responses</h3>
              {stats.recent.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="recent-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Sport</th>
                        <th>Routine</th>
                        <th>Intensity</th>
                        <th>Cues</th>
                        <th>Ease</th>
                        <th>Likelihood</th>
                        <th>Feedback</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent.map((r) => (
                        <tr key={r.id}>
                          <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                            {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td style={{ fontSize: 12 }}>{r.name || '—'}</td>
                          <td>{r.sport}</td>
                          <td style={{ fontSize: 12 }}>{r.routine}</td>
                          <td style={{ textAlign: 'center' }}>{r.intensity}</td>
                          <td style={{ textAlign: 'center' }}>{r.cues}</td>
                          <td style={{ textAlign: 'center' }}>{r.ease}</td>
                          <td style={{ textAlign: 'center' }}>{r.likelihood}</td>
                          <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                            {r.open_feedback || '—'}
                          </td>
                          <td><DeleteButton id={r.id!} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No responses yet.</p>
              )}
            </div>
          </>
        ) : null}
      </div>
    </>
  )
}
