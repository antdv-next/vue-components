import { classNames as classnames } from '@v-c/util'
import { defineComponent, ref, watch } from 'vue'
import { generatorCollapsePanelContentProps } from './interface'

const PanelContent = defineComponent({
  name: 'PanelContent',
  inheritAttrs: false,
  props: generatorCollapsePanelContentProps(),
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
        classNames: customizeizeClassNames,
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
          style={style}
          role={role}
        >
          <div
            class={classnames(
              `${prefixCls}-body`,
              customizeizeClassNames?.body,
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
