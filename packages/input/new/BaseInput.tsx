import type { BaseInputProps } from './interface'
import { clsx } from '@v-c/util'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { computed, createVNode, defineComponent, Fragment, shallowRef } from 'vue'
import { hasAddon, hasPrefixSuffix } from './utils/commonUtils'

export interface HolderRef {
  /** Provider holder ref. Will return `null` if not wrap anything */
  nativeElement: HTMLElement | null
}

const BaseInput = defineComponent<
  BaseInputProps
>(
  (props, { slots, expose, attrs }) => {
    const containerRef = shallowRef<HTMLDivElement>()
    const onInputClick = (e: MouseEvent) => {
      if (containerRef.value?.contains(e.target as Element)) {
        props?.triggerFocus?.()
      }
    }
    const hasAffix = computed(() => hasPrefixSuffix(props))

    // ======================== Ref ======================== //
    const groupRef = shallowRef<HTMLDivElement>()
    expose({
      nativeElement: computed(() => groupRef.value || containerRef.value),
    })
    return () => {
      const {
        components,
        allowClear,
        readOnly,
        disabled,
        value,
        prefixCls,
        handleReset,
        onClear,
        suffix,
        focused,
        classNames,
        styles,
        dataAttrs,
        prefix,
        addonAfter,
        addonBefore,
        hidden,
      } = props
      let children: any = filterEmpty(slots?.default?.() ?? [])
      if (children.length === 1) {
        children = children[0]
      }
      else {
        children = createVNode(Fragment, null, children)
      }
      const inputElement = children
      const AffixWrapperComponent = components?.affixWrapper || 'span'
      const GroupWrapperComponent = components?.groupWrapper || 'span'
      const WrapperComponent = components?.wrapper || 'span'
      const GroupAddonComponent = components?.groupAddon || 'span'

      let element = createVNode(inputElement, {
        value,
        class: !hasAffix.value && classNames?.variant,
      })
      // ================== Prefix & Suffix ================== //
      if (hasAffix.value) {
        let clearIcon: any = null

        // ================== Clear Icon ================== //
        if (allowClear) {
          const needClear = !disabled && !readOnly && value
          const clearIconCls = `${prefixCls}-clear-icon`
          const iconNode
            = typeof allowClear === 'object' && allowClear?.clearIcon
              ? allowClear.clearIcon
              : '✖'

          clearIcon = (
            <button
              type="button"
              tabindex={-1}
              onClick={(event) => {
                handleReset?.(event)
                onClear?.()
              }}
              // Do not trigger onBlur when clear input
              // https://github.com/ant-design/ant-design/issues/31200
              onMousedown={e => e.preventDefault()}
              class={clsx(clearIconCls, {
                [`${clearIconCls}-hidden`]: !needClear,
                [`${clearIconCls}-has-suffix`]: !!suffix,
              })}
            >
              {iconNode}
            </button>
          )
        }

        const affixWrapperPrefixCls = `${prefixCls}-affix-wrapper`
        const affixWrapperCls = clsx(
          affixWrapperPrefixCls,
          {
            [`${prefixCls}-disabled`]: disabled,
            [`${affixWrapperPrefixCls}-disabled`]: disabled, // Not used, but keep it
            [`${affixWrapperPrefixCls}-focused`]: focused, // Not used, but keep it
            [`${affixWrapperPrefixCls}-readonly`]: readOnly,
            [`${affixWrapperPrefixCls}-input-with-clear-btn`]:
                      suffix && allowClear && value,
          },
          classNames?.affixWrapper,
          classNames?.variant,
        )

        const suffixNode = (suffix || allowClear) && (
          <span
            class={clsx(`${prefixCls}-suffix`, classNames?.suffix)}
            style={styles?.suffix}
          >
            {clearIcon}
            {suffix}
          </span>
        )

        element = (
          <AffixWrapperComponent
            class={affixWrapperCls}
            style={styles?.affixWrapper}
            onClick={onInputClick}
            {...dataAttrs?.affixWrapper}
            ref={containerRef}
          >
            {prefix && (
              <span
                class={clsx(`${prefixCls}-prefix`, classNames?.prefix)}
                style={styles?.prefix}
              >
                {prefix}
              </span>
            )}
            {element}
            {suffixNode}
          </AffixWrapperComponent>
        )
      }

      // ================== Addon ================== //
      if (hasAddon(props)) {
        const wrapperCls = `${prefixCls}-group`
        const addonCls = `${wrapperCls}-addon`
        const groupWrapperCls = `${wrapperCls}-wrapper`

        const mergedWrapperClassName = clsx(
          `${prefixCls}-wrapper`,
          wrapperCls,
          classNames?.wrapper,
        )

        const mergedGroupClassName = clsx(
          groupWrapperCls,
          {
            [`${groupWrapperCls}-disabled`]: disabled,
          },
          classNames?.groupWrapper,
        )

        // Need another wrapper for changing display:table to display:inline-block
        // and put style prop in wrapper
        element = (
          <GroupWrapperComponent class={mergedGroupClassName} ref={groupRef}>
            <WrapperComponent class={mergedWrapperClassName}>
              {addonBefore && (
                <GroupAddonComponent class={addonCls}>
                  {addonBefore}
                </GroupAddonComponent>
              )}
              {element}
              {addonAfter && (
                <GroupAddonComponent class={addonCls}>
                  {addonAfter}
                </GroupAddonComponent>
              )}
            </WrapperComponent>
          </GroupWrapperComponent>
        )
      }
      // `className` and `style` are always on the root element
      return createVNode(element, {
        ...attrs,
        hidden,
      })
    }
  },
  {
    name: 'BaseInput',
    inheritAttrs: false,
  },
)
export default BaseInput
