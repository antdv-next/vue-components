import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import { clsx } from '@v-c/util'
import { toPropsRefs } from '@v-c/util/dist/props-util'
import { computed, defineComponent } from 'vue'
import { useStepsProvider } from './Context.ts'
import Step from './Step.tsx'

export type Status = 'error' | 'process' | 'finish' | 'wait'

const EmptyObject: Record<string, any> = {}

export type SemanticName
  = | 'root'
    | 'item'
    | 'itemWrapper'
    | 'itemHeader'
    | 'itemTitle'
    | 'itemSubtitle'
    | 'itemSection'
    | 'itemContent'
    | 'itemIcon'
    | 'itemRail'

export type ItemSemanticName
  = | 'root'
    | 'wrapper'
    | 'header'
    | 'title'
    | 'subtitle'
    | 'section'
    | 'content'
    | 'icon'
    | 'rail'

export type ComponentType = string | any

export interface StepItem {
  /** @deprecated Please use `content` instead. */
  description?: VueNode
  content?: VueNode
  disabled?: boolean
  icon?: VueNode
  status?: Status
  subTitle?: VueNode
  title?: VueNode
  classNames?: Partial<Record<ItemSemanticName, string>>
  styles?: Partial<Record<ItemSemanticName, CSSProperties>>
  onClick?: (e: MouseEvent) => void
  class?: string
  style?: CSSProperties
}

export type StepIconRender = (info: {
  index: number
  status: Status
  title: VueNode
  // @deprecated Please use `content` instead.
  description: VueNode
  content: VueNode
  node: VueNode
}) => VueNode

export interface RenderInfo {
  index: number
  active: boolean
  item: StepItem
}

export interface StepsProps {
  // style
  prefixCls?: string
  style?: CSSProperties
  className?: string
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  rootClassName?: string

  // layout
  orientation?: 'horizontal' | 'vertical'
  titlePlacement?: 'horizontal' | 'vertical'

  // a11y
  /** Internal usage of antd. Do not deps on this. */
  components?: {
    root?: ComponentType
    item?: ComponentType
  }

  // data
  status?: Status
  current?: number
  initial?: number
  items?: StepItem[]
  onChange?: (current: number) => void

  // render
  iconRender?: (
    originNode: any,
    info: RenderInfo & {
      components: {
        Icon: any
      }
    },
  ) => any
  itemRender?: (originNode: any, info: RenderInfo) => any
  itemWrapperRender?: (originNode: any) => any
}

const defaults = {
  prefixCls: 'vc-steps',
  status: 'process',
  current: 0,
  initial: 0,
} as any

const Steps = defineComponent<StepsProps>(
  (props = defaults, { attrs }) => {
    const { orientation, titlePlacement, items, initial, current, status, components, prefixCls } = toPropsRefs(
      props,
      'orientation',
      'titlePlacement',
      'items',
      'initial',
      'current',
      'status',
      'components',
      'prefixCls',
    )
    // ============================= layout =============================
    const isVertical = computed(() => orientation.value === 'vertical')
    const mergedOrientation = computed(() => isVertical.value ? 'vertical' : 'horizontal')
    const mergeTitlePlacement = computed(() => !isVertical.value && titlePlacement.value === 'vertical' ? 'vertical' : 'horizontal')

    // ============================== Data ==============================
    const mergedItems = computed(() => {
      return (items.value || []).filter(Boolean)
    })

    const statuses = computed(() => {
      return mergedItems.value.map((item, index) => {
        const itemStatus = item.status
        const stepNumber = initial.value! + index
        if (!itemStatus) {
          if (stepNumber === current.value) {
            return status.value
          }
          else if (stepNumber < current.value!) {
            return 'finish'
          }
          return 'wait'
        }
        return itemStatus
      })
    })

    // ============================= events =============================
    const onStepClick = (next: number) => {
      if (props.onChange && current.value !== next) {
        props.onChange(next)
      }
    }

    const stepIconContext = computed(() => {
      return {
        prefixCls: prefixCls.value,
        classNames: props.classNames,
        styles: props.styles,
        ItemComponent: components.value?.item ?? 'div',
      }
    })
    useStepsProvider(stepIconContext as any)

    const renderStep = (item: StepItem, index: number) => {
      const { classNames, styles, itemRender, iconRender, itemWrapperRender } = props
      const stepIndex = initial.value! + index
      const itemStatus = statuses.value[index]!
      const nextStatus = statuses.value[index + 1]!

      const data = {
        ...item,
        status: itemStatus,
      }

      return (
        <Step
          key={stepIndex}
          // Style
          prefixCls={prefixCls.value}
          classNames={classNames ?? {}}
          styles={styles ?? {}}
          // Data
          data={data}
          nextStatus={nextStatus}
          active={stepIndex === current.value}
          index={stepIndex}
          last={mergedItems.value.length - 1 === index}
          // Render
          iconRender={iconRender}
          itemRender={itemRender}
          itemWrapperRender={itemWrapperRender}
          onClick={props.onChange ? onStepClick : undefined}
        />
      )
    }

    return () => {
      const {
        classNames = EmptyObject,
        styles = EmptyObject,
        rootClassName,
        className,
        style,
      } = props
      const { root: RootComponent = 'div' } = components.value ?? {}

      // ============================= styles =============================
      const classString = clsx(
        prefixCls.value,
        `${prefixCls.value}-${mergedOrientation.value}`,
        `${prefixCls.value}-title-${mergeTitlePlacement.value}`,
        rootClassName,
        className,
        classNames.root,
      )
      // ============================= render =============================

      return (
        <RootComponent
          class={classString}
          style={{
            ...style,
            ...styles?.root,
          }}
          {...attrs}
        >
          {mergedItems.value.map(renderStep)}
        </RootComponent>
      )
    }
  },
  {
    name: 'Steps',
    inheritAttrs: false,
  },
)

export default Steps
