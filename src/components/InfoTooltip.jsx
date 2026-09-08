import { useState } from 'react'

export default function InfoTooltip({ text }) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className="info-icon-wrapper"
      tabIndex={0}
      role="button"
      aria-label="Weitere Informationen"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setVisible((v) => !v)
      }}
    >
      <span className="info-icon">i</span>
      {visible && <span className="tooltip-bubble" role="tooltip">{text}</span>}
    </span>
  )
}
