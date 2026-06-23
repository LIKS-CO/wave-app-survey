'use server'

import { createResponse } from './db'

export async function submitSurvey(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const getNum = (key: string) => parseInt(formData.get(key) as string, 10)
    const getStr = (key: string) => (formData.get(key) as string) || null

    const discomfort = formData.getAll('entry.DISCOMFORT') as string[]

    await createResponse({
      sport: getStr('entry.SPORT')!,
      routine: getStr('entry.ROUTINE')!,
      intensity: getNum('entry.INTENSITY'),
      cues: getNum('entry.CUES'),
      discomfort,
      ease: getNum('entry.EASE'),
      science_clarity: getStr('entry.SCIENCE_CLARITY')!,
      best_feature: getStr('entry.BEST_FEATURE'),
      likelihood: getNum('entry.LIKELIHOOD'),
      open_feedback: getStr('entry.OPEN_FEEDBACK'),
    })

    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to submit response' }
  }
}
