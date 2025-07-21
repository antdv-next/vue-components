import clsx from 'classnames'
import { computed, defineComponent } from 'vue'
import { generatorUploadProps, type UploadProps } from './interface'

export const AjaxUploader = defineComponent<UploadProps>({
  props: generatorUploadProps(),
  setup(props) {
    const cls = computed(() => {
      const { prefixCls, disabled, className } = props

      return clsx({
        [prefixCls!]: true,
        [`${prefixCls}-disabled`]: disabled,
        [className!]: className,
      })
    })
    return () => {
      const Tag = props.component
      return (
        <Tag class={cls}>
        </Tag>
      )
    }
  },
})
