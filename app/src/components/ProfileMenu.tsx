import { ChevronDown, CircleHelp, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { MODES } from '../content/modes'
import { cleanName, initialOf, MAX_NAME, toneOf } from '../state/name'
import { useProgress, type Mode, type TextSize } from '../state/progress'
import { tours } from '../state/tour'
import { Choice } from './Choice'

const TEXT_SIZES: { id: TextSize; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'large', label: 'Large' },
  { id: 'larger', label: 'Larger' },
]

export function Avatar({ name }: { name: string }) {
  return (
    <span className={`avatar is-tone-${toneOf(name)}`} aria-hidden="true">
      {initialOf(name)}
    </span>
  )
}

/**
 * The learner's name and settings, behind the avatar in the header. A
 * disclosure, not an ARIA menu, because it holds forms and radio groups.
 */
export function ProfileMenu() {
  const { progress, update, reset } = useProgress()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [confirming, setConfirming] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const valid = cleanName(draft)

  const close = (refocus = true) => {
    setOpen(false)
    setEditing(false)
    setConfirming(false)
    if (refocus) buttonRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLElement>('button, input')?.focus()
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setEditing(false)
        setConfirming(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      setEditing(false)
      setConfirming(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="profile" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="profile-button"
        data-tour="profile"
        aria-expanded={open}
        aria-controls="profile-panel"
        aria-label={`Profile and settings for ${progress.name}`}
        onClick={() => (open ? close(false) : setOpen(true))}
      >
        <Avatar name={progress.name} />
        <span className="profile-name">{progress.name}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open && (
        <div id="profile-panel" className="profile-panel" ref={panelRef} role="group" aria-label="Profile and settings">
          {editing ? (
            <form
              className="profile-edit"
              onSubmit={(e) => {
                e.preventDefault()
                if (!valid) return
                update({ name: valid })
                setEditing(false)
              }}
            >
              <label htmlFor="profile-name-input" className="setting-label">
                Your name
              </label>
              <input
                id="profile-name-input"
                value={draft}
                maxLength={MAX_NAME}
                onChange={(e) => setDraft(e.target.value)}
                aria-invalid={draft.trim() !== '' && !valid}
                aria-describedby="profile-name-rule"
              />
              <p id="profile-name-rule" className={`fine${draft.trim() !== '' && !valid ? ' is-error' : ''}`}>
                Letters, with single spaces or hyphens between parts.
              </p>
              <div className="row">
                <button type="submit" className="btn btn-primary" disabled={!valid}>
                  Save
                </button>
                <button type="button" className="btn btn-quiet" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-who">
              <Avatar name={progress.name} />
              <strong>{progress.name}</strong>
              <button
                type="button"
                className="btn btn-quiet btn-small"
                onClick={() => {
                  setDraft(progress.name)
                  setEditing(true)
                }}
              >
                <Pencil size={14} aria-hidden="true" />
                Change name
              </button>
            </div>
          )}

          <Choice
            id="profile-mode"
            label="Support mode"
            options={(Object.keys(MODES) as Mode[]).map((m) => ({ id: m, label: MODES[m].name }))}
            value={progress.mode}
            onChange={(mode) => update({ mode })}
          />
          <Choice
            id="profile-text"
            label="Text size"
            options={TEXT_SIZES}
            value={progress.textSize}
            onChange={(textSize) => update({ textSize })}
          />
          <Choice
            id="profile-narrate"
            label="Read animation steps aloud"
            options={[
              { id: 'off', label: 'Off' },
              { id: 'on', label: 'On' },
            ]}
            value={progress.narrate ? 'on' : 'off'}
            onChange={(v) => update({ narrate: v === 'on' })}
          />

          <div className="profile-actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                close()
                tours.start()
              }}
            >
              <CircleHelp size={18} aria-hidden="true" />
              Take the tour
            </button>
            {confirming ? (
              <div className="profile-confirm" role="group" aria-label="Confirm reset">
                <span>Delete all progress, badges and notes on this device?</span>
                <div className="row">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      close(false)
                      reset()
                    }}
                  >
                    Yes, reset
                  </button>
                  <button type="button" className="btn btn-quiet" onClick={() => setConfirming(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="btn btn-quiet" onClick={() => setConfirming(true)}>
                <Trash2 size={18} aria-hidden="true" />
                Reset progress
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
