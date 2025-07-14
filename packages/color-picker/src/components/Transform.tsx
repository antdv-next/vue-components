import type { FunctionalComponent } from 'vue'

const Transform: FunctionalComponent<{
  x: number
  y: number
}> = (props, { slots }) => {
  const { x, y } = props

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        zIndex: 1,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {slots.default?.()}
    </div>
  )
}

Transform.inheritAttrs = false

export default Transform
