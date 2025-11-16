import type { VueNode } from '@v-c/util/dist/type'
import type { PropType } from 'vue'
import type { Icons, ProgressDotRender, Status, StepIconRender } from './interface'
import { classNames } from '@v-c/util'
import omit from '@v-c/util/dist/omit'
import { computed, defineComponent } from 'vue'
import Step from './Step'

type StepProps = InstanceType<typeof Step>['$props']

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
}

export function generatorStepsProps() {
  return {
    prefixCls: {
      type: String,
      default: 'vc-steps',
    },
    className: String,
    style: {
      type: Object,
      default: () => ({}),
    },
    iconPrefix: {
      type: String,
      default: 'vc',
    },
    status: {
      type: String as PropType<Status>,
      default: 'process',
    },
    icons: Object as PropType<Icons>,
    progressDot: {
      type: [Boolean, Function] as PropType<boolean | ProgressDotRender>,
      default: false,
    },
    stepIcon: Function as PropType<StepIconRender>,
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal',
    },
    type: {
      type: String as PropType<'default' | 'navigation' | 'inline'>,
      default: 'default',
    },
    labelPlacement: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal',
    },
    size: {
      type: String as PropType<'default' | 'small'>,
    },
    current: {
      type: Number,
      default: 0,
    },
    initial: {
      type: Number,
      default: 0,
    },
    items: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    onChange: Function as PropType<((current: number) => void) | undefined>,
    itemRender: Function as PropType<(item: StepProps, stepItem: VueNode) => VueNode>,
  }
}

const Steps = defineComponent({
  props: generatorStepsProps(),
  setup(props) {
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
      const { stepIcon, icons, onChange, initial, current, iconPrefix, style, itemRender, status, prefixCls } = props
      const mergedItem: Mutable<StepProps> = { ...item }
      const stepNumber = initial + index

      // fix tail color
      if (status === 'error' && index === current - 1) {
        mergedItem.className = `${prefixCls}-next-error`
      }

      if (!mergedItem.status) {
        if (stepNumber === current) {
          mergedItem.status = status as Status
        }
        else if (stepNumber < current) {
          mergedItem.status = 'finish'
        }
        else {
          mergedItem.status = 'wait'
        }
      }

      if (isInline.value) {
        mergedItem.icon = undefined
        mergedItem.subTitle = undefined
      }

      if (!mergedItem.render && itemRender) {
        mergedItem.render = (stepItem: VueNode) => itemRender(mergedItem, stepItem)
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
        prefixCls,
        className,
        items,
        style,
      } = props

      const restProps = omit(props, ['prefixCls', 'className', 'style', 'direction', 'type', 'labelPlacement', 'iconPrefix', 'status', 'size', 'current', 'progressDot', 'stepIcon', 'initial', 'icons', 'onChange', 'itemRender', 'items'])

      const classString = classNames(prefixCls, `${prefixCls}-${mergedDirection.value}`, className, {
        [`${prefixCls}-${mergedSize.value}`]: mergedSize.value,
        [`${prefixCls}-label-${adjustedLabelPlacement.value}`]: mergedDirection.value === 'horizontal',
        [`${prefixCls}-dot`]: !!mergedProgressDot.value,
        [`${prefixCls}-navigation`]: isNav.value,
        [`${prefixCls}-inline`]: isInline.value,
      })

      return (
        <div class={classString} style={style} {...restProps}>
          {items.filter(Boolean).map<VueNode>(renderStep)}
        </div>
      )
    }
  },
})

export default Steps
