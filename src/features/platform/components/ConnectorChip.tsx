import './ConnectorChip.css'

interface ConnectorChipProps {
  name: string
  initial: string
  color: string
}

function ConnectorChip({ name, initial, color }: ConnectorChipProps) {
  return (
    <span className="connector-chip">
      <span
        className="connector-chip__icon"
        style={{ backgroundColor: color }}
      >
        {initial}
      </span>
      <span className="connector-chip__name">{name}</span>
    </span>
  )
}

export default ConnectorChip
