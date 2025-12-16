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
      const baseClassName = `${props.prefixCls}-indent-unit`
      const list = []

      for (let i = 0; i < props.level; i += 1) {
        list.push(
          <span
            key={i}
            class={clsx(baseClassName, {
              [`${baseClassName}-start`]: props.isStart?.[i],
              [`${baseClassName}-end`]: props.isEnd?.[i],
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
