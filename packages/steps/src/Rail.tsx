import type { CSSProperties } from 'vue'
import type { Status } from './Steps'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'

export interface RailProps {
  prefixCls: string
  className: string
  status: Status
  style?: CSSProperties
}

const Rail = defineComponent<RailProps>(
  (props) => {
    return () => {
      const { prefixCls, className, status, style } = props
      const railCls = `${prefixCls}-rail`

      // ============================= render =============================
      return <div class={clsx(railCls, `${railCls}-${status}`, className)} style={style} />
    }
  },
  {
    name: 'StepsRail',
    inheritAttrs: false,
  },
)

export default Rail
