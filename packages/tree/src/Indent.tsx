import type { PropType } from 'vue'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Indent',
  props: {
    prefixCls: { type: String, required: true },
    level: { type: Number, required: true },
    isStart: { type: Array as PropType<boolean[]>, default: () => [] },
    isEnd: { type: Array as PropType<boolean[]>, default: () => [] },
  },
  setup(props) {
    return () => {
      const baseClassName = `${props.prefixCls}-indent-unit`
      const list: any[] = []
      for (let i = 0; i < props.level; i += 1) {
        list.push(
          <span
            key={i}
            class={clsx(baseClassName, {
              [`${baseClassName}-start`]: props.isStart[i],
              [`${baseClassName}-end`]: props.isEnd[i],
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
})
