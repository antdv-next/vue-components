import type { CollapsePanelProps } from './interface'
import { classNames as classnames } from '@v-c/util'
import { defineComponent, ref, watch } from 'vue'

const PanelContent = defineComponent<CollapsePanelProps>({
  name: 'PanelContent',
  inheritAttrs: false,
  setup(props, { slots }) {
    const rendered = ref(props.isActive || props.forceRender)

    watch(
      () => [props.isActive, props.forceRender],
      () => {
        if (props.isActive || props.forceRender) {
          rendered.value = true
        }
      },
    )

    return () => {
      if (!rendered.value) {
        return null
      }

      const {
        prefixCls,
        isActive,
        style,
        role,
        className,
        classNames: customizeClassNames,
        styles,
      } = props

      return (
        <div
          class={classnames(
            `${prefixCls}-panel`,
            {
              [`${prefixCls}-panel-active`]: isActive,
              [`${prefixCls}-panel-inactive`]: !isActive,
            },
            className,
          )}
          style={style as any}
          role={role}
        >
          <div
            class={classnames(
              `${prefixCls}-body`,
              customizeClassNames?.body,
            )}
            style={styles?.body}
          >
            {slots.default?.()}
          </div>
        </div>
      )
    }
  },
})

export default PanelContent
