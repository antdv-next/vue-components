import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'

export interface IndentProps {
  prefixCls: string
  level: number
  isStart?: boolean[]
  isEnd?: boolean[]
}

const Indent = defineComponent<IndentProps>(
  (props) => {
    return () => {
      const { prefixCls, level, isStart, isEnd } = props
      const baseClassName = `${prefixCls}-indent-unit`
      const list = []

      for (let i = 0; i < level; i += 1) {
        list.push(
          <span
            key={i}
            class={clsx(baseClassName, {
              [`${baseClassName}-start`]: isStart?.[i],
              [`${baseClassName}-end`]: isEnd?.[i],
            })}
          />,
        )
      }

      return (
        <span aria-hidden="true" class={`${props.prefixCls}-indent`}>
          {list}
        </span>
      )
    }
  },
  {
    name: 'Indent',
    inheritAttrs: false,
  },
)

export default Indent
