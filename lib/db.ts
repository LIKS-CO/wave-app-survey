import { neon } from '@neondatabase/serverless'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set')
  return neon(url)
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

export async function createResponse(data: SurveyResponse) {
  const sql = getSql()
  const result = await sql`
    INSERT INTO responses (sport, routine, intensity, cues, discomfort, ease, science_clarity, best_feature, likelihood, open_feedback)
    VALUES (${data.sport}, ${data.routine}, ${data.intensity}, ${data.cues}, ${data.discomfort}, ${data.ease}, ${data.science_clarity}, ${data.best_feature}, ${data.likelihood}, ${data.open_feedback})
    RETURNING id
  `
  return result[0].id as number
}

export async function getStats() {
  const sql = getSql()

  const [total] = await sql`SELECT COUNT(*)::int as count FROM responses`

  const sportDistribution = await sql`
    SELECT sport, COUNT(*)::int as count
    FROM responses
    GROUP BY sport
    ORDER BY count DESC
  `

  const routineDistribution = await sql`
    SELECT routine, COUNT(*)::int as count
    FROM responses
    GROUP BY routine
    ORDER BY count DESC
  `

  const [averages] = await sql`
    SELECT
      ROUND(AVG(intensity)::numeric, 1) as avg_intensity,
      ROUND(AVG(cues)::numeric, 1) as avg_cues,
      ROUND(AVG(ease)::numeric, 1) as avg_ease,
      ROUND(AVG(likelihood)::numeric, 1) as avg_likelihood
    FROM responses
  `

  const discomfortDistribution = await sql`
    SELECT unnest(discomfort) as value, COUNT(*)::int as count
    FROM responses
    GROUP BY value
    ORDER BY count DESC
  `

  const scienceClarity = await sql`
    SELECT science_clarity, COUNT(*)::int as count
    FROM responses
    GROUP BY science_clarity
    ORDER BY count DESC
  `

  const bestFeature = await sql`
    SELECT best_feature, COUNT(*)::int as count
    FROM responses
    WHERE best_feature IS NOT NULL AND best_feature != ''
    GROUP BY best_feature
    ORDER BY count DESC
  `

  const recent = await sql`
    SELECT * FROM responses
    ORDER BY created_at DESC
    LIMIT 20
  `

  return {
    total: (total as { count: number }).count,
    sportDistribution: sportDistribution as { sport: string; count: number }[],
    routineDistribution: routineDistribution as { routine: string; count: number }[],
    averages: averages as { avg_intensity: number; avg_cues: number; avg_ease: number; avg_likelihood: number },
    discomfortDistribution: discomfortDistribution as { value: string; count: number }[],
    scienceClarity: scienceClarity as { science_clarity: string; count: number }[],
    bestFeature: bestFeature as { best_feature: string; count: number }[],
    recent: recent as SurveyResponse[],
  }
}
