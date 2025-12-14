import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type { TransformType } from '../hooks/useImageTransform.ts'
import type { ImgInfo } from '../Image.tsx'
import type { Actions, PreviewProps, ToolbarRenderInfoType } from './index.tsx'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'

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
  icon: VueNode
  type: OperationType
  disabled?: boolean
  onClick: () => void
}

export interface FooterProps extends Actions {
  prefixCls: string
  showProgress: boolean
  countRender?: PreviewProps['countRender']
  actionsRender?: PreviewProps['actionsRender']
  current: number
  count: number
  showSwitch: boolean
  icons: PreviewProps['icons']
  scale: number
  minScale: number
  maxScale: number
  image: ImgInfo
  transform: TransformType

  // Style
  classNames: Record<string, string | undefined>
  styles: Record<string, CSSProperties | undefined>
}

const Footer = defineComponent<FooterProps>(
  (props) => {
    const renderOperation = ({ type, disabled, onClick, icon }: RenderOperationParams) => {
      const actionCls = `${props.prefixCls}-actions-action`
      return (
        <div
          key={type}
          class={clsx(actionCls, `${actionCls}-${type}`, {
            [`${actionCls}-disabled`]: !!disabled,
          })}
          onClick={() => {
            if (!disabled) {
              onClick()
            }
          }}
        >
          {icon}
        </div>
      )
    }

    return () => {
      const {
        prefixCls,
        showProgress,
        current,
        count,
        showSwitch,
        classNames,
        styles,
        icons,
        image,
        transform,
        countRender,
        actionsRender,
        scale,
        minScale,
        maxScale,
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

      const progressNode = showProgress && (
        <div class={`${prefixCls}-progress`}>
          {countRender ? countRender(current + 1, count) : <bdi>{`${current + 1} / ${count}`}</bdi>}
        </div>
      )

      const switchPrevNode = showSwitch
        ? renderOperation({
            icon: (icons?.prev ?? icons?.left) as VueNode,
            onClick: () => onActive(-1),
            type: 'prev',
            disabled: current === 0,
          })
        : undefined

      const switchNextNode = showSwitch
        ? renderOperation({
            icon: (icons?.next ?? icons?.right) as VueNode,
            onClick: () => onActive(1),
            type: 'next',
            disabled: current === count - 1,
          })
        : undefined

      const flipYNode = renderOperation({
        icon: icons?.flipY as VueNode,
        onClick: onFlipY,
        type: 'flipY',
      })

      const flipXNode = renderOperation({
        icon: icons?.flipX as VueNode,
        onClick: onFlipX,
        type: 'flipX',
      })

      const rotateLeftNode = renderOperation({
        icon: icons?.rotateLeft as VueNode,
        onClick: onRotateLeft,
        type: 'rotateLeft',
      })

      const rotateRightNode = renderOperation({
        icon: icons?.rotateRight as VueNode,
        onClick: onRotateRight,
        type: 'rotateRight',
      })

      const zoomOutNode = renderOperation({
        icon: icons?.zoomOut as VueNode,
        onClick: onZoomOut,
        type: 'zoomOut',
        disabled: scale <= minScale,
      })

      const zoomInNode = renderOperation({
        icon: icons?.zoomIn as VueNode,
        onClick: onZoomIn,
        type: 'zoomIn',
        disabled: scale === maxScale,
      })

      const actionsNode = (
        <div class={clsx(`${prefixCls}-actions`, classNames.actions)} style={styles.actions}>
          {flipYNode}
          {flipXNode}
          {rotateLeftNode}
          {rotateRightNode}
          {zoomOutNode}
          {zoomInNode}
        </div>
      )

      const renderNode = actionsRender
        ? actionsRender(actionsNode, {
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
        } satisfies ToolbarRenderInfoType)
        : actionsNode

      return (
        <div class={clsx(`${prefixCls}-footer`, classNames.footer)} style={styles.footer}>
          {progressNode}
          {renderNode}
        </div>
      )
    }
  },
  { name: 'ImagePreviewFooter' },
)

export default Footer
