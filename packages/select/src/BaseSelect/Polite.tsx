import { defineComponent } from 'vue'
import type { DisplayValueType } from '.'

export interface PoliteProps {
  visible: boolean
  values: DisplayValueType[]
}

const Polite = defineComponent<PoliteProps>((props) => {
  return () => {
    const { visible, values } = props
    if (!visible) {
      return null
    }
    const MAX_COUNT = 50
    return (
      <span
        aria-live="polite"
        style={{ width: 0, height: 0, position: 'absolute', overflow: 'hidden', opacity: 0 }}
      >
        {`${values
          .slice(0, MAX_COUNT)
          .map(({ label, value }) => (['number', 'string'].includes(typeof label) ? label : value))
          .join(', ')}`}
        {values.length > MAX_COUNT ? ', ...' : null}
      </span>
    )
  }
})

export default Polite
