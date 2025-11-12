import type { CSSProperties, SVGAttributes } from 'vue'
import type { PosInfo } from './hooks/useTarget'
import type { SemanticName, TourProps } from './interface'
import Portal from '@v-c/portal'
import { clsx } from '@v-c/util'
import { defineComponent, useId } from 'vue'

const COVER_PROPS: SVGAttributes = {
  'fill': 'transparent',
  'pointer-events': 'auto',
}

export interface MaskProps {
  prefixCls?: string
  pos?: PosInfo | null // 获取引导卡片指向的元素
  rootClassName?: string
  showMask?: boolean
  // to fill mask color, e.g. rgba(80,0,0,0.5)
  fill?: string
  open?: boolean
  animated?: boolean | { placeholder: boolean }
  zIndex?: number
  disabledInteraction?: boolean
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  getPopupContainer?: TourProps['getPopupContainer']
}

const Mask = defineComponent<MaskProps>(
  (props, { attrs }) => {
    const id = useId()
    const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    return () => {
      const {
        prefixCls,
        rootClassName,
        pos,
        showMask,
        fill = 'rgba(0,0,0,0.5)',
        open,
        animated,
        zIndex,
        disabledInteraction,
        styles,
        classNames: tourClassNames,
        getPopupContainer,
      } = props
      const maskId = `${prefixCls}-mask-${id}`
      const mergedAnimated = typeof animated === 'object' ? animated?.placeholder : animated

      const maskRectSize = isSafari
        ? { width: '100%', height: '100%' }
        : { width: '100vw', height: '100vh' }

      const inlineMode = getPopupContainer === false

      return (
        <Portal open={open} autoLock={!inlineMode} getContainer={getPopupContainer as any}>
          <div
            class={clsx(`${prefixCls}-mask`, rootClassName, tourClassNames?.mask)}
            style={{
              position: inlineMode ? 'absolute' : 'fixed',
              left: `0px`,
              right: `0px`,
              top: `0px`,
              bottom: `0px`,
              zIndex,
              pointerEvents: pos && !disabledInteraction ? 'none' : 'auto',
              ...(attrs as any).style,
              ...styles?.mask,
            }}
          >
            {
              // eslint-disable-next-line style/multiline-ternary
              showMask ? (
                <svg style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <mask id={maskId}>
                      <rect x="0" y="0" {...maskRectSize} fill="white" />
                      {pos && (
                        <rect
                          x={pos.left}
                          y={pos.top}
                          rx={pos.radius}
                          width={pos.width}
                          height={pos.height}
                          fill="black"
                          class={
                            mergedAnimated ? `${prefixCls}-placeholder-animated` : ''
                          }
                        />
                      )}
                    </mask>
                  </defs>
                  <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill={fill}
                    mask={`url(#${maskId})`}
                  />

                  {/* Block click region */}
                  {pos && (
                    <>
                      {/* Top */}

                      <rect
                        {...COVER_PROPS}
                        x="0"
                        y="0"
                        width="100%"
                        height={Math.max(pos.top, 0)}
                      />
                      {/* Left */}
                      <rect
                        {...COVER_PROPS}
                        x="0"
                        y="0"
                        width={Math.max(pos.left, 0)}
                        height="100%"
                      />
                      {/* Bottom */}
                      <rect
                        {...COVER_PROPS}
                        x="0"
                        y={pos.top + pos.height}
                        width="100%"
                        height={`calc(100% - ${pos.top + pos.height}px)`}
                      />
                      {/* Right */}
                      <rect
                        {...COVER_PROPS}
                        x={pos.left + pos.width}
                        y="0"
                        width={`calc(100% - ${pos.left + pos.width}px)`}
                        height="100%"
                      />
                    </>
                  )}
                </svg>
              ) : null
            }
          </div>
        </Portal>
      )
    }
  },
  {
    name: 'TourMask',
    inheritAttrs: false,
  },
)

export default Mask
