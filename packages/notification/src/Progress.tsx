import type { CSSProperties, FunctionalComponent } from 'vue'

export interface NotificationProgressProps {
  class?: string
  style?: CSSProperties
  percent: number
}

const Progress: FunctionalComponent<NotificationProgressProps> = (props) => {
  return (
    <progress
      class={props.class}
      max="100"
      value={props.percent}
      style={props.style}
    />
  )
}

Progress.props = ['class', 'style', 'percent'] as any
Progress.inheritAttrs = false

export default Progress
