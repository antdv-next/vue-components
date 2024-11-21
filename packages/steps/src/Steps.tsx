import type { VueNode } from '@v-c/util/dist/type'
import type { StepProps, StepsProps } from './interface'
import classNames from 'classnames'
import { computed, defineComponent } from 'vue'
import Step from './Step'

export default defineComponent<StepsProps>((props) => {
  const isNav = computed(() => props.type === 'navigation')
  const isInline = computed(() => props.type === 'inline')

  const mergedProgressDot = computed(() => isInline.value || props.progressDot)
  const mergedDirection = computed(() => isInline.value ? 'horizontal' : props.direction)
  const mergedSize = computed(() => isInline.value ? undefined : props.size)

  const adjustedLabelPlacement = computed(() => mergedProgressDot.value ? 'vertical' : props.labelPlacement)

  const onStepClick = (next: number) => {
    const { current = 0 } = props
    if (props.onChange && current !== next) {
      props.onChange(next)
    }
  }

  const renderStep = (item: StepProps, index: number) => {
    const { stepIcon, icons, onChange, initial = 0, current = 0, iconPrefix = 'vc', style = {}, itemRender, status = 'process', prefixCls = 'vs-steps' } = props
    const mergedItem: StepProps = { ...item }
    const stepNumber = initial + index

    // fix tail color
    if (status === 'error' && index === current - 1) {
      mergedItem.className = `${prefixCls}-next-error`
    }

    if (!mergedItem.status) {
      if (stepNumber === current) {
        mergedItem.status = status
      }
      else if (stepNumber < current) {
        mergedItem.status = 'finish'
      }
      else {
        mergedItem.status = 'wait'
      }
    }

    if (isInline) {
      mergedItem.icon = undefined
      mergedItem.subTitle = undefined
    }

    if (!mergedItem.render && itemRender) {
      mergedItem.render = stepItem => itemRender(mergedItem, stepItem)
    }

    return (
      <Step
        {...mergedItem}
        active={stepNumber === current}
        stepNumber={stepNumber + 1}
        stepIndex={stepNumber}
        key={stepNumber}
        prefixCls={prefixCls}
        iconPrefix={iconPrefix}
        wrapperStyle={style}
        progressDot={mergedProgressDot.value}
        stepIcon={stepIcon}
        icons={icons}
        onStepClick={onChange && onStepClick}
      />
    )
  }
  return () => {
    const {
      prefixCls = 'vs-steps',
      className,
      items = [],
      style = {},
    } = props

    const classString = classNames(prefixCls, `${prefixCls}-${mergedDirection.value}`, className, {
      [`${prefixCls}-${mergedSize}`]: mergedSize.value,
      [`${prefixCls}-label-${adjustedLabelPlacement.value}`]: mergedDirection.value === 'horizontal',
      [`${prefixCls}-dot`]: !!mergedProgressDot.value,
      [`${prefixCls}-navigation`]: isNav.value,
      [`${prefixCls}-inline`]: isInline.value,
    })

    return (
      <div class={classString} style={style}>
        {items.filter(Boolean).map<VueNode>(renderStep)}
      </div>
    )
  }
})