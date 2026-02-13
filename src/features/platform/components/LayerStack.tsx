import type { ArchitectureLayer } from '../types'
import './LayerStack.css'

interface LayerStackProps {
  layers: ArchitectureLayer[]
}

function LayerStack({ layers }: LayerStackProps) {
  return (
    <div className="layer-stack">
      {layers.map((layer) => (
        <div
          key={layer.level}
          className={`layer-stack__layer layer-stack__layer--l${layer.level}`}
        >
          <span className="layer-stack__level">{layer.levelLabel}</span>
          <h4 className="layer-stack__title">{layer.name}</h4>
          <p className="layer-stack__desc">{layer.description}</p>
        </div>
      ))}
    </div>
  )
}

export default LayerStack
