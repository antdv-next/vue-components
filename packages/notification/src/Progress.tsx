import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'

export interface NotificationProgressProps {
  className?: string
  style?: CSSProperties
  percent: number
}

const Progress = defineComponent<NotificationProgressProps>(
  (props) => {
    return () => (
      <progress
        class={props.className}
        max="100"
        value={props.percent}
        style={props.style}
      />
    )
  },
  {
    name: 'NotificationProgress',
    inheritAttrs: false,
  },
)

export default Progress
