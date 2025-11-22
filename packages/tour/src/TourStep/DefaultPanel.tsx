import type { TourStepProps } from '../interface'
import { clsx } from '@v-c/util'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { defineComponent } from 'vue'

export type DefaultPanelProps = Omit<TourStepProps, 'closable'> & {
  closable?: Exclude<TourStepProps['closable'], boolean> | null
}

const DefaultPanel = defineComponent<DefaultPanelProps>(
  (props, { attrs }) => {
    return () => {
      const {
        prefixCls,
        current,
        total,
        title,
        description,
        onClose,
        onPrev,
        onNext,
        onFinish,
        closable,
        classNames: tourClassNames,
        styles,
      } = props
      const ariaProps = pickAttrs(closable || {}, true)
      const closeIcon = closable?.closeIcon ?? (
        <span class={`${prefixCls}-close-x`}>&times;</span>
      )
      const mergedClosable = !!closable
      const className = attrs.class as string
      return (
        <div class={clsx(`${prefixCls}-panel`, className)}>
          <div
            class={clsx(`${prefixCls}-section`, tourClassNames?.section)}
            style={styles?.section}
          >
            {mergedClosable && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                {...ariaProps}
                class={`${prefixCls}-close`}
              >
                {closeIcon}
              </button>
            )}
            <div
              class={clsx(`${prefixCls}-header`, tourClassNames?.header)}
              style={styles?.header}
            >
              <div
                class={clsx(`${prefixCls}-title`, tourClassNames?.title)}
                style={styles?.title}
              >
                {title}
              </div>
            </div>
            <div
              class={clsx(
                `${prefixCls}-description`,
                tourClassNames?.description,
              )}
              style={styles?.description}
            >
              {description}
            </div>
            <div
              class={clsx(`${prefixCls}-footer`, tourClassNames?.footer)}
              style={styles?.footer}
            >
              <div class={`${prefixCls}-sliders`}>
                {total! > 1
                  ? [...Array.from({ length: total! }).keys()].map((item, index) => {
                      return (
                        <span
                          key={item}
                          class={index === current ? 'active' : ''}
                        />
                      )
                    })
                  : null}
              </div>
              <div
                class={clsx(`${prefixCls}-actions`, tourClassNames?.actions)}
                style={styles?.actions}
              >
                {current !== 0
                  ? (
                      <button class={`${prefixCls}-prev-btn`} onClick={onPrev}>
                        Prev
                      </button>
                    )
                  : null}
                {current === total! - 1
                  ? (
                      <button class={`${prefixCls}-finish-btn`} onClick={onFinish}>
                        Finish
                      </button>
                    )
                  : (
                      <button class={`${prefixCls}-next-btn`} onClick={onNext}>
                        Next
                      </button>
                    )}
              </div>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    name: 'TourDefaultPanel',
    inheritAttrs: false,
  },
)

export default DefaultPanel
