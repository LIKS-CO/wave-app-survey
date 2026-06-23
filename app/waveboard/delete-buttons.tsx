'use client'

import { useTransition } from 'react'
import { removeResponse, removeAllResponses } from '@/lib/actions'

export function DeleteButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm('Delete this response? This cannot be undone.')) {
          startTransition(async () => {
            await removeResponse(id)
          })
        }
      }}
      style={{
        background: 'none',
        border: 'none',
        cursor: pending ? 'wait' : 'pointer',
        color: 'var(--signal)',
        fontSize: 12,
        padding: '2px 6px',
        opacity: pending ? 0.5 : 1,
      }}
      title="Delete response"
    >
      {pending ? '…' : '✕'}
    </button>
  )
}

export function ClearAllButton() {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm('Delete ALL responses? This cannot be undone.')) {
          startTransition(async () => {
            await removeAllResponses()
          })
        }
      }}
      style={{
        background: 'transparent',
        border: '1.5px solid var(--border)',
        color: 'var(--signal)',
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.04em',
        padding: '8px 16px',
        borderRadius: 8,
        cursor: pending ? 'wait' : 'pointer',
        opacity: pending ? 0.5 : 1,
        transition: 'border-color 0.15s',
      }}
    >
      {pending ? 'Clearing…' : 'Clear All'}
    </button>
  )
}
