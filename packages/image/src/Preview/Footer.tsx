import type { ExtractPropTypes, PropType, VNode } from 'vue'
import type { PreviewProps } from '.'
import type { TransformType } from '../hooks/useImageTransform'
import type { ImgInfo } from '../Image'
import { classNames as classnames } from '@v-c/util'
import { computed, defineComponent } from 'vue'

export type FooterSemanticName = 'footer' | 'actions'

type OperationType
  = | 'prev'
    | 'next'
    | 'flipY'
    | 'flipX'
    | 'rotateLeft'
    | 'rotateRight'
    | 'zoomOut'
    | 'zoomIn'

interface RenderOperationParams {
  icon?: VNode
  type: OperationType
  disabled?: boolean
  onClick: (e: MouseEvent) => void
}

function footerProps() {
  return {
    prefixCls: String,
    showProgress: Boolean,
    countRender: Function,
    actionsRender: Function,
    current: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 1,
    },
    showSwitch: Boolean,
    icons: {
      type: Object as PropType<PreviewProps['icons']>,
      required: true,
    },
    scale: {
      type: Number,
      required: true,
    },
    minScale: {
      type: Number,
      required: true,
    },
    maxScale: {
      type: Number,
      required: true,
    },
    image: Object as PropType<ImgInfo>,
    transform: Object as PropType<TransformType>,
    onActive: Function as PropType<(offset: number) => void>,
    onFlipY: Function as PropType<() => void>,
    onFlipX: Function as PropType<() => void>,
    onRotateLeft: Function as PropType<() => void>,
    onRotateRight: Function as PropType<() => void>,
    onZoomOut: Function as PropType<() => void>,
    onZoomIn: Function as PropType<() => void>,
    onClose: Function as PropType<() => void>,
    onReset: Function as PropType<() => void>,
  }
}

export type PreviewFooterProps = Partial<ExtractPropTypes<ReturnType<typeof footerProps>>>

export default defineComponent({
  name: 'PreviewFooter',
  props: {
    ...footerProps(),
  },
  emits: ['active', 'flipY', 'flipX', 'rotateLeft', 'rotateRight', 'zoomOut', 'zoomIn', 'close', 'reset'],
  setup(props, { emit }) {
    // >>>>> Actions
    const actionCls = computed(() => {
      return `${props.prefixCls}-actions-action`
    })

    const renderOperation = ({ type, disabled, onClick, icon }: RenderOperationParams) => {
      return (
        <div
          key={type}
          class={classnames(actionCls.value, `${actionCls.value}-${type}`, {
            [`${actionCls.value}-disabled`]: !!disabled,
          })}
          onClick={onClick}
        >
          {icon}
        </div>
      )
    }

    // >>>>> Render
    return () => {
      // 修改解构，添加缺失的属性，并提供默认值
      const {
        prefixCls,
        showProgress,
        current,
        count,
        showSwitch,

        // render
        icons = {},
        image,
        transform,
        countRender,
        actionsRender,

        // Scale
        scale,
        minScale,
        maxScale,

        // Actions
        onActive,
        onFlipY,
        onFlipX,
        onRotateLeft,
        onRotateRight,
        onZoomOut,
        onZoomIn,
        onClose,
        onReset,
      } = props

      const { left, right, prev, next, flipY, flipX, rotateLeft, rotateRight, zoomOut, zoomIn } = icons
      // ========================== Render ==========================
      // >>>>> Progress
      const progressNode = showProgress && (
        <div class={`${prefixCls}-progress`}>
          {countRender ? countRender(current + 1, count) : <bdi>{`${current + 1} / ${count}`}</bdi>}
        </div>
      )

      const switchPrevNode = showSwitch
        ? renderOperation({
            icon: prev ?? left,
            onClick: () => emit('active', -1),
            type: 'prev',
            disabled: current === 0,
          })
        : undefined

      const switchNextNode = showSwitch
        ? renderOperation({
            icon: next ?? right,
            onClick: () => emit('active', 1),
            type: 'next',
            disabled: current === count - 1,
          })
        : undefined

      const flipYNode = renderOperation({
        icon: flipY,
        onClick: () => emit('flipY'),
        type: 'flipY',
      })

      const flipXNode = renderOperation({
        icon: flipX,
        onClick: () => emit('flipX'),
        type: 'flipX',
      })

      const rotateLeftNode = renderOperation({
        icon: rotateLeft,
        onClick: () => emit('rotateLeft'),
        type: 'rotateLeft',
      })

      const rotateRightNode = renderOperation({
        icon: rotateRight,
        onClick: () => emit('rotateRight'),
        type: 'rotateRight',
      })

      const zoomOutNode = renderOperation({
        icon: zoomOut,
        onClick: () => emit('zoomOut'),
        type: 'zoomOut',
        disabled: scale! <= minScale!,
      })

      const zoomInNode = renderOperation({
        icon: zoomIn,
        onClick: () => emit('zoomIn'),
        type: 'zoomIn',
        disabled: scale === maxScale,
      })

      const actionsNode = (
        <div class={classnames(`${prefixCls}-actions`)}>
          {flipYNode}
          {flipXNode}
          {rotateLeftNode}
          {rotateRightNode}
          {zoomOutNode}
          {zoomInNode}
        </div>
      )

      return (
        <div class={classnames(`${prefixCls}-footer`)}>
          {progressNode}
          {actionsRender
            ? actionsRender({
                actionsNode,
                icons: {
                  prevIcon: switchPrevNode,
                  nextIcon: switchNextNode,
                  flipYIcon: flipYNode,
                  flipXIcon: flipXNode,
                  rotateLeftIcon: rotateLeftNode,
                  rotateRightIcon: rotateRightNode,
                  zoomOutIcon: zoomOutNode,
                  zoomInIcon: zoomInNode,
                },
                actions: {
                  onActive,
                  onFlipY,
                  onFlipX,
                  onRotateLeft,
                  onRotateRight,
                  onZoomOut,
                  onZoomIn,
                  onReset,
                  onClose,
                },
                transform,
                current,
                total: count,
                image,
              })
            : actionsNode}
        </div>
      )
    }
  },
})
