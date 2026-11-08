/** A group of mutually exclusive choices, marked the same way as every other choice group in the app. */
export function Choice<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string
  label: string
  options: { id: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="setting">
      <p id={id} className="setting-label">
        {label}
      </p>
      <div className="segmented" role="radiogroup" aria-labelledby={id}>
        {options.map((o) => (
          <button
            type="button"
            key={o.id}
            role="radio"
            aria-checked={value === o.id}
            className={value === o.id ? 'is-on' : undefined}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
