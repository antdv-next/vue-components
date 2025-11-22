import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, PropType } from 'vue'
import type { Icons, ProgressDotRender, Status, StepIconRender } from './interface'
import { classNames } from '@v-c/util'
import KeyCode from '@v-c/util/dist/KeyCode'
import { computed, defineComponent } from 'vue'

function isString(str: any): str is string {
  return typeof str === 'string'
}
export function generatorStepProps() {
  return {
    prefixCls: String,
    className: String,
    style: Object as PropType<CSSProperties>,
    wrapperStyle: Object as PropType<CSSProperties>,
    iconPrefix: String,
    active: Boolean,
    disabled: Boolean,
    stepIndex: Number,
    stepNumber: Number,
    status: String as PropType<Status>,
    title: [String, Object, Function] as PropType<VueNode>,
    subTitle: [String, Object, Function] as PropType<VueNode>,
    description: [String, Object, Function] as PropType<VueNode>,
    tailContent: [String, Object, Function] as PropType<VueNode>,
    icon: [String, Object, Function] as PropType<VueNode>,
    icons: Object as PropType<Icons>,
    onClick: Function as PropType<(e: MouseEvent) => void>,
    onStepClick: Function as PropType<((index: number) => void) | undefined>,
    progressDot: [Boolean, Function] as PropType<boolean | ProgressDotRender>,
    stepIcon: Function as PropType<StepIconRender>,
    render: Function as PropType<(stepItem: VueNode) => VueNode>,
    refixCls: String,
  }
}

export default defineComponent({
  props: generatorStepProps(),
  setup(props, { attrs }) {
    const clickable = computed(() => !!props.onStepClick && !props.disabled)

    const accessibilityProps = computed(() => {
      if (clickable.value) {
        return {
          role: 'button',
          tabIndex: 0,
          onClick: (e: MouseEvent) => {
            props.onClick?.(e)
            props.onStepClick?.(props.stepIndex!)
          },
          onKeydown: (e: KeyboardEvent) => {
            const which = e.which || e.keyCode || e.code
            if (which === KeyCode.ENTER || which === KeyCode.SPACE) {
              props.onStepClick?.(props.stepIndex!)
            }
          },
        }
      }

      return {}
    })

    const renderIconNode = () => {
      const { stepIcon, stepNumber, title, description, progressDot, prefixCls, iconPrefix, status, icons, icon } = props
      let iconNode: VueNode
      const iconClassName = classNames(`${prefixCls}-icon`, `${iconPrefix}icon`, {
        [`${iconPrefix}icon-${icon}`]: icon && isString(icon),
        [`${iconPrefix}icon-check`]:
          !icon && status === 'finish' && ((icons && !icons.finish) || !icons),
        [`${iconPrefix}icon-cross`]:
          !icon && status === 'error' && ((icons && !icons.error) || !icons),
      })

      const iconDot = <span class={`${prefixCls}-icon-dot`} />

      if (progressDot) {
        if (typeof progressDot === 'function') {
          iconNode = (
            <span class={`${prefixCls}-icon`}>
              {progressDot(iconDot, {
                index: stepNumber! - 1,
                status: status!,
                title,
                description,
              })}
            </span>
          )
        }
        else {
          iconNode = <span class={`${prefixCls}-icon`}>{iconDot}</span>
        }
      }
      else if (icon && !isString(icon)) {
        iconNode = <span class={`${prefixCls}-icon`}>{icon}</span>
      }
      else if (icons && icons.finish && status === 'finish') {
        iconNode = <span class={`${prefixCls}-icon`}>{icons.finish}</span>
      }
      else if (icons && icons.error && status === 'error') {
        iconNode = <span class={`${prefixCls}-icon`}>{icons.error}</span>
      }
      else if (icon || status === 'finish' || status === 'error') {
        iconNode = <span class={iconClassName} />
      }
      else {
        iconNode = <span class={`${prefixCls}-icon`}>{stepNumber}</span>
      }

      if (stepIcon) {
        iconNode = stepIcon({
          index: stepNumber! - 1,
          status: status!,
          title,
          description,
          node: iconNode,
        })
      }

      return iconNode
    }

    const mergedStatus = computed(() => props.status || 'wait')
    return () => {
      const { prefixCls, className, icon, active, style = {}, disabled, tailContent, onClick, title, subTitle, description, render } = props
      const classString = classNames(
        `${prefixCls}-item`,
        `${prefixCls}-item-${mergedStatus.value}`,
        className,
        {
          [`${prefixCls}-item-custom`]: icon,
          [`${prefixCls}-item-active`]: active,
          [`${prefixCls}-item-disabled`]: disabled === true,
        },
      )

      const { ...restProps } = attrs
      const stepItemStyle: CSSProperties = { ...(style as CSSProperties) }
      let stepNode: VueNode = (
        <div {...restProps} class={classString} style={stepItemStyle}>
          <div onClick={onClick} {...accessibilityProps.value} class={`${prefixCls}-item-container`}>
            <div class={`${prefixCls}-item-tail`}>{tailContent}</div>
            <div class={`${prefixCls}-item-icon`}>{renderIconNode()}</div>
            <div class={`${prefixCls}-item-content`}>
              <div class={`${prefixCls}-item-title`}>
                {title}
                {subTitle && (
                  <div
                    title={typeof subTitle === 'string' ? subTitle : undefined}
                    class={`${prefixCls}-item-subtitle`}
                  >
                    {subTitle}
                  </div>
                )}
              </div>
              {description && <div class={`${prefixCls}-item-description`}>{description}</div>}
            </div>
          </div>
        </div>
      )

      if (render) {
        stepNode = (render(stepNode) || null)
      }

      return stepNode
    }
  },
})
