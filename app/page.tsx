'use client'

import React, { useState, useCallback } from 'react'
import { submitSurvey } from '@/lib/actions'

const REQUIRED = ['entry.SPORT', 'entry.ROUTINE', 'entry.INTENSITY', 'entry.CUES', 'entry.EASE', 'entry.SCIENCE_CLARITY', 'entry.LIKELIHOOD'] as const

const sports = [
  'Running', 'Athletics', 'Basketball', 'Soccer', 'Tennis / Padel',
  'Climbing', 'Swimming', 'Cycling', 'Powerlifting / CrossFit',
  'Gymnastics', 'General strength training', 'Other',
]

const routines = [
  { value: 'Pre-session activation', label: 'Pre-session activation' },
  { value: 'Post-session recovery', label: 'Post-session recovery' },
  { value: 'Weekly injury prevention', label: 'Weekly injury prevention' },
  { value: 'Movement assessment', label: 'Movement assessment' },
]

const discomfortOptions = [
  'None — felt good throughout',
  'Joint discomfort (knee, ankle, shoulder, etc.)',
  'Muscle tightness',
  'Balance or coordination issues',
  'Fatigue before the routine ended',
]

const scienceOptions = [
  { value: 'Yes, well explained', label: 'Yes — I understood why each exercise was included' },
  { value: 'Somewhat', label: 'Somewhat — could have been clearer' },
  { value: 'No', label: 'No — I didn\'t see the rationale' },
]

const bestFeatureOptions = [
  'Exercise demonstrations',
  'Coaching cues and form tips',
  'Session structure and pacing',
  'Injury risk information',
  'Post-session summary',
]

function ScaleQuestion({ name, labels }: { name: string; labels: [string, string, string] }) {
  return (
    <div className="scale-row">
      {[1, 2, 3, 4, 5].map((val) => (
        <React.Fragment key={val}>
          <input type="radio" id={`${name}${val}`} name={name} value={val} required={val === 1} />
          <label htmlFor={`${name}${val}`} className="scale-option">
            <div className="scale-btn">{val}</div>
            <div className="scale-caption">
              {val === 1 ? labels[0] : val === 3 ? labels[1] : val === 5 ? labels[2] : ''}
            </div>
          </label>
        </React.Fragment>
      ))}
    </div>
  )
}

function isFieldFilled(name: string, form: HTMLFormElement) {
  const el = form.elements.namedItem(name) as HTMLSelectElement | HTMLInputElement | HTMLInputElement[] | null
  if (!el) return false
  if (el instanceof HTMLSelectElement) return el.value !== ''
  if (el instanceof HTMLInputElement && el.type === 'radio') {
    const radios = form.querySelectorAll<HTMLInputElement>(`[name="${name}"]`)
    return [...radios].some(r => r.checked)
  }
  if (el instanceof HTMLInputElement) return el.value !== ''
  return false
}

function calcProgress(form: HTMLFormElement) {
  const filled = REQUIRED.filter((n) => isFieldFilled(n, form)).length
  return Math.round((filled / REQUIRED.length) * 100)
}

export default function SurveyPage() {
  const [progress, setProgress] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    setProgress(calcProgress(e.currentTarget))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget

    let valid = true
    for (const name of REQUIRED) {
      if (!isFieldFilled(name, form)) {
        valid = false
        const el = form.elements.namedItem(name)
        if (el) {
          const first = el instanceof RadioNodeList ? el[0] : el
          const block = (first as HTMLElement).closest('.q-block')
          if (block) {
            block.scrollIntoView({ behavior: 'smooth', block: 'center' })
            ;(block as HTMLElement).style.outline = '2px solid #EF9F27'
            setTimeout(() => (block as HTMLElement).style.outline = '', 2000)
          }
        }
        break
      }
    }

    if (!valid) return

    setPending(true)
    const fd = new FormData(form)
    const result = await submitSurvey(fd)
    setPending(false)

    if (!result.success) {
      setError(result.error ?? 'Something went wrong. Check your DATABASE_URL.')
      form.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (submitted) {
    return (
      <>
        <div className="survey-header">
          <div className="brand-eyebrow">Wave by KOVA</div>
          <div className="survey-title">Session Feedback</div>
          <div className="survey-subtitle">5 minutes · 10 questions · anonymous</div>
        </div>
        <div className="form-container">
          <div className="thankyou">
            <div className="thankyou-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Received.</h2>
            <p>Your feedback shapes Wave.<br />Protect the form — see you next session.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="survey-header">
        <div className="brand-eyebrow">Wave by KOVA</div>
        <div className="survey-title">Session Feedback</div>
        <div className="survey-subtitle">5 minutes · 10 questions · anonymous</div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="form-container">
        <form id="waveForm" onChange={handleChange} onSubmit={handleSubmit}>

          <div className="section-label">The Session</div>

          <div className="q-block">
            <label className="q-label" htmlFor="sport">Which sport or activity did you complete today?<span className="required">*</span></label>
            <select id="sport" name="entry.SPORT" required defaultValue="">
              <option value="" disabled>Select one</option>
              {sports.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="q-block">
            <label className="q-label">Which routine did the app guide you through?<span className="required">*</span></label>
            <div className="check-group">
              {routines.map((r) => (
                <label key={r.value} className="check-option">
                  <input type="radio" name="entry.ROUTINE" value={r.value} required />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          <div className="section-label">How Your Body Felt</div>

          <div className="q-block">
            <label className="q-label">How well did the exercises match the intensity of your session?<span className="required">*</span></label>
            <ScaleQuestion name="entry.INTENSITY" labels={['Too light', 'Just right', 'Too demanding']} />
          </div>

          <div className="q-block">
            <label className="q-label">How clearly did your body respond to the movement cues in the routine?<span className="required">*</span></label>
            <ScaleQuestion name="entry.CUES" labels={["Didn't connect", 'Somewhat', 'Very clearly']} />
          </div>

          <div className="q-block">
            <label className="q-label">Did you experience any discomfort during the exercises? (Select all that apply)</label>
            <div className="check-group">
              {discomfortOptions.map((d) => (
                <label key={d} className="check-option">
                  <input type="checkbox" name="entry.DISCOMFORT" value={d} />
                  {d}
                </label>
              ))}
            </div>
          </div>

          <div className="section-label">The App</div>

          <div className="q-block">
            <label className="q-label">How easy was it to follow the session inside the app?<span className="required">*</span></label>
            <ScaleQuestion name="entry.EASE" labels={['Confusing', 'Fine', 'Seamless']} />
          </div>

          <div className="q-block">
            <label className="q-label">Was the science behind each exercise clearly explained?<span className="required">*</span></label>
            <div className="check-group">
              {scienceOptions.map((o) => (
                <label key={o.value} className="check-option">
                  <input type="radio" name="entry.SCIENCE_CLARITY" value={o.value} required />
                  {o.label}
                </label>
              ))}
            </div>
          </div>

          <div className="q-block">
            <label className="q-label">What was the most useful part of today&apos;s session in the app?</label>
            <div className="check-group">
              {bestFeatureOptions.map((f) => (
                <label key={f} className="check-option">
                  <input type="radio" name="entry.BEST_FEATURE" value={f} />
                  {f}
                </label>
              ))}
            </div>
          </div>

          <div className="q-block">
            <label className="q-label">How likely are you to use Wave again before your next session?<span className="required">*</span></label>
            <ScaleQuestion name="entry.LIKELIHOOD" labels={['Very unlikely', 'Maybe', 'Definitely']} />
          </div>

          <div className="q-block">
            <label className="q-label" htmlFor="openFeedback">Anything the app should do differently?</label>
            <textarea
              id="openFeedback"
              name="entry.OPEN_FEEDBACK"
              placeholder="Describe a specific moment where the app fell short — or a feature you'd expect from a product like this."
              maxLength={500}
            />
          </div>

          <div className="submit-wrap">
            <p className="submit-note">
              Responses are anonymous and used exclusively to improve Wave. This survey does not collect personal data.
            </p>
            {error && (
              <p style={{ fontSize: 13, color: 'var(--signal)', marginBottom: 12, lineHeight: 1.5 }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn-submit" disabled={pending}>
              {pending ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </div>

        </form>
      </div>
    </>
  )
}
