import type { MouseEventHandler } from '@v-c/util/dist/EventInterface'
import type { CSSProperties } from 'vue'
import type { IDialogPropTypes } from '../../IDialogPropTypes'
import { classNames, clsx } from '@v-c/util'
import { useLockFocus } from '@v-c/util/dist/Dom/focus'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { getStylePxValue } from '@v-c/util/dist/props-util'
import { computed, defineComponent, shallowRef } from 'vue'
import { useGetRefContext } from '../../context'

export interface PanelProps extends Omit<IDialogPropTypes, 'getOpenCount'> {
  prefixCls: string
  ariaId?: string
  onMouseDown?: (e: MouseEvent) => void
  onMouseUp?: MouseEventHandler
  holderRef?: (el: HTMLDivElement) => void
  /** Used for focus lock. When true and open, focus will lock into the panel */
  isFixedPos?: boolean
}

export interface ContentRef {
  focus: () => void
}

const Panel = defineComponent<PanelProps & { animationVisible: boolean }>(
  (props, { expose, slots }) => {
    // ================================= Refs =================================
    const { setPanel } = useGetRefContext()
    const internalRef = shallowRef<HTMLDivElement>()
    const mergeRefFun = (el: HTMLDivElement) => {
      internalRef.value = el
      setPanel?.(el)
      props?.holderRef?.(el)
    }
    useLockFocus(
      computed(() => !!props.visible && !!props.isFixedPos && props.focusTrap !== false),
      () => internalRef.value!,
    )
    expose({
      focus: () => {
        internalRef.value?.focus?.({ preventScroll: true })
      },
    })
    return () => {
      const {
        width,
        height,
        footer,
        prefixCls,
        classNames: modalClassNames,
        styles: modalStyles,
        title,
        closable,
        closeIcon,
        bodyProps,
        bodyStyle,
        ariaId,
        style,
        className,
        forceRender,
        onClose,
        onMouseDown,
        onMouseUp,
        modalRender,
        animationVisible,
      } = props
      // ================================ Style =================================
      const contentStyle: CSSProperties = {}
      if (width !== undefined) {
        contentStyle.width = getStylePxValue(width)
      }
      if (height !== undefined) {
        contentStyle.height = getStylePxValue(height)
      }

      // ================================ Render ================================
      const footerNode = footer
        ? (
            <div
              class={classNames(`${prefixCls}-footer`, modalClassNames?.footer)}
              style={{ ...modalStyles?.footer }}
            >
              {footer}
            </div>
          )
        : null

      const headerNode = title
        ? (
            <div class={classNames(`${prefixCls}-header`, modalClassNames?.header)} style={{ ...modalStyles?.header }}>
              <div
                class={clsx(`${prefixCls}-title`, modalClassNames?.title)}
                id={ariaId}
                style={{ ...modalStyles?.title }}
              >
                {title}
              </div>
            </div>
          )
        : null

      const closableFun = () => {
        if (typeof closable === 'object' && closable !== null) {
          return closable
        }
        if (closable) {
          return {
            closeIcon: closeIcon ?? <span class={`${prefixCls}-close-x`} />,
          }
        }
        return {}
      }
      const closableObj = closableFun()

      const ariaProps = pickAttrs(closableObj, true)

      const closeBtnIsDisabled = typeof (closable) === 'object' && closable?.disabled

      const closerNode = closable
        ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              {...ariaProps}
              class={`${prefixCls}-close`}
              disabled={closeBtnIsDisabled}
            >
              {closableObj.closeIcon}
            </button>
          )
        : null

      const content = (
        <div
          class={classNames(`${prefixCls}-container`, modalClassNames?.container)}
          style={modalStyles?.container}
        >
          {closerNode}
          {headerNode}

          <div
            class={classNames(`${prefixCls}-body`, modalClassNames?.body)}
            style={{ ...bodyStyle, ...modalStyles?.body }}
            {...bodyProps}
          >
            {slots?.default?.()}
          </div>
          {footerNode}
        </div>
      )

      const renderContent = () => {
        if (!animationVisible && forceRender) {
          return null
        }
        return modalRender ? modalRender(content) : content
      }

      return (
        <div
          key="dialog-element"
          role="dialog"
          {
            ...{
              'aria-labelledby': title ? ariaId : null,
            } as any
          }
          aria-modal="true"
          ref={mergeRefFun}
          style={{ ...style, ...contentStyle }}
          class={[prefixCls, className]}
          onMousedown={onMouseDown}
          onMouseup={onMouseUp}
          tabindex={-1}
        >
          {renderContent()}
        </div>
      )
    }
  },
  {
    name: 'Panel',
    inheritAttrs: false,
  },
)

export default Panel
