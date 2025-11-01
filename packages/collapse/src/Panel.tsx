import type { HTMLAttributes } from 'vue'
import type { CollapsePanelProps } from './interface'
import { classNames as classnames } from '@v-c/util'
import KeyCode from '@v-c/util/dist/KeyCode'
import omit from '@v-c/util/dist/omit.ts'
import { computed, defineComponent, ref, Transition } from 'vue'
import PanelContent from './PanelContent'

const defaults = {
  showArrow: true,
  classNames: {},
  styles: {},
} as any

const CollapsePanel = defineComponent<CollapsePanelProps>({
  name: 'CollapsePanel',
  inheritAttrs: false,
  setup(props = defaults, { attrs, expose }) {
    const disabled = computed(() => props.collapsible === 'disabled')
    const refWrapper = ref()
    const ifExtraExist = computed(
      () =>
        props.extra !== null
        && props.extra !== undefined
        && typeof props.extra !== 'boolean',
    )

    const collapsibleProps = computed(() => {
      return {
        'onClick': () => {
          props.onItemClick?.(props.panelKey!)
        },
        'onKeydown': (e: KeyboardEvent) => {
          if (
            e.key === 'Enter'
            || e.keyCode === KeyCode.ENTER
            || e.which === KeyCode.ENTER
          ) {
            props.onItemClick?.(props.panelKey!)
          }
        },
        'role': props.accordion ? 'tab' : 'button',
        'aria-expanded': props.isActive,
        'aria-disabled': disabled.value,
        'tabIndex': disabled.value ? -1 : 0,
      }
    })

    expose({
      ref: refWrapper,
    })

    return () => {
      const {
        extra,
        prefixCls,
        isActive,
        className,
        expandIcon,
        forceRender,
        headerClass,
        collapsible,
        accordion,
        openMotion = {},
        onItemClick,
        classNames: customizeClassNames = {},
        showArrow = true,
        destroyOnHidden,
        styles = {},
        header,
        panelKey,
        children,
        ...restProps
      } = props

      const collapsePanelClassNames = classnames(
        `${prefixCls}-item`,
        {
          [`${prefixCls}-item-active`]: isActive,
          [`${prefixCls}-item-disabled`]: disabled.value,
        },
        className,
      )
      const headerClassName = classnames(
        headerClass,
        `${prefixCls}-header`,
        {
          [`${prefixCls}-collapsible-${collapsible}`]: !!collapsible,
        },
        customizeClassNames.header,
      )

      const headerProps: HTMLAttributes = {
        class: headerClassName,
        style: styles.header,
        ...(['header', 'icon'].includes(collapsible!)
          ? {}
          : collapsibleProps.value),
      }

      // ======================== Icon ========================
      const iconNodeInner
        = typeof expandIcon === 'function'
          ? (
              expandIcon(props)
            )
          : (
              <i class="arrow" />
            )
      const iconNode = iconNodeInner && (
        <div
          class={classnames(`${prefixCls}-expand-icon`, customizeClassNames?.icon)}
          style={styles?.icon}
          {...(['header', 'icon'].includes(collapsible!)
            ? collapsibleProps.value
            : {})}
        >
          {iconNodeInner}
        </div>
      )

      const panelContent = (
        <PanelContent
          v-show={isActive}
          prefixCls={prefixCls}
          classNames={customizeClassNames}
          styles={styles}
          isActive={isActive}
          forceRender={forceRender}
          role={accordion ? 'tabpanel' : undefined}
          v-slots={{ default: () => children }}
        />
      )

      const transitionProps = {
        'appear': false,
        'leave-to-class': `${prefixCls}-panel-hidden`,
        ...openMotion,
      }

      const mergedRestProps = {
        ...restProps,
        ...omit(attrs, ['class']),
      }

      return (
        <div
          {...mergedRestProps as any}
          ref={refWrapper}
          class={collapsePanelClassNames}
        >
          <div {...headerProps}>
            {showArrow && iconNode}
            <span
              class={classnames(
                `${prefixCls}-title`,
                customizeClassNames?.title,
              )}
              style={styles?.title}
              {...(collapsible === 'header' ? collapsibleProps.value : {})}
            >
              {header}
            </span>
            {ifExtraExist.value && (
              <div class={`${prefixCls}-extra`}>{extra}</div>
            )}
          </div>

          <Transition {...transitionProps}>
            { !destroyOnHidden ? panelContent : (isActive ? panelContent : null) }
          </Transition>
        </div>
      )
    }
  },
})

export default CollapsePanel
