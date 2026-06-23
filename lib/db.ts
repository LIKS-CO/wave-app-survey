import { Pool } from 'pg'

function getPool(): Pool {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set')

  return new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 10000 })
}

export type SurveyResponse = {
  id?: number
  created_at?: string
  sport: string
  routine: string
  intensity: number
  cues: number
  discomfort: string[]
  ease: number
  science_clarity: string
  best_feature: string | null
  likelihood: number
  open_feedback: string | null
}

export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const pool = getPool()
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    await pool.end()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export async function createResponse(data: SurveyResponse) {
  const pool = getPool()
  const result = await pool.query(
    `INSERT INTO responses (sport, routine, intensity, cues, discomfort, ease, science_clarity, best_feature, likelihood, open_feedback)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      data.sport,
      data.routine,
      data.intensity,
      data.cues,
      data.discomfort,
      data.ease,
      data.science_clarity,
      data.best_feature,
      data.likelihood,
      data.open_feedback,
    ]
  )
  await pool.end()
  return result.rows[0].id as number
}

export async function getStats() {
  const pool = getPool()

  const total = await pool.query('SELECT COUNT(*)::int as count FROM responses')

  const sportDistribution = await pool.query(
    'SELECT sport, COUNT(*)::int as count FROM responses GROUP BY sport ORDER BY count DESC'
  )

  const routineDistribution = await pool.query(
    'SELECT routine, COUNT(*)::int as count FROM responses GROUP BY routine ORDER BY count DESC'
  )

  const averages = await pool.query(`
    SELECT
      ROUND(AVG(intensity)::numeric, 1) as avg_intensity,
      ROUND(AVG(cues)::numeric, 1) as avg_cues,
      ROUND(AVG(ease)::numeric, 1) as avg_ease,
      ROUND(AVG(likelihood)::numeric, 1) as avg_likelihood
    FROM responses
  `)

  const discomfortDistribution = await pool.query(
    'SELECT unnest(discomfort) as value, COUNT(*)::int as count FROM responses GROUP BY value ORDER BY count DESC'
  )

  const scienceClarity = await pool.query(
    'SELECT science_clarity, COUNT(*)::int as count FROM responses GROUP BY science_clarity ORDER BY count DESC'
  )

  const bestFeature = await pool.query(
    "SELECT best_feature, COUNT(*)::int as count FROM responses WHERE best_feature IS NOT NULL AND best_feature != '' GROUP BY best_feature ORDER BY count DESC"
  )

  const recent = await pool.query(
    'SELECT * FROM responses ORDER BY created_at DESC LIMIT 20'
  )

  await pool.end()

  return {
    total: total.rows[0].count as number,
    sportDistribution: sportDistribution.rows as { sport: string; count: number }[],
    routineDistribution: routineDistribution.rows as { routine: string; count: number }[],
    averages: averages.rows[0] as { avg_intensity: number; avg_cues: number; avg_ease: number; avg_likelihood: number },
    discomfortDistribution: discomfortDistribution.rows as { value: string; count: number }[],
    scienceClarity: scienceClarity.rows as { science_clarity: string; count: number }[],
    bestFeature: bestFeature.rows as { best_feature: string; count: number }[],
    recent: recent.rows as SurveyResponse[],
  }
}
