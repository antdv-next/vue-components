import type { MouseEventHandler } from '@v-c/util/dist/EventInterface'
import type { CSSProperties, SlotsType } from 'vue'
import { cloneElement } from '@v-c/util/dist/vnode'
import { classNames as classnames } from '@v-c/util'
import { defineComponent, ref } from 'vue'
import { baseInputProps } from './interface'
import { hasAddon, hasPrefixSuffix } from './utils/commonUtils'

export default defineComponent({
  name: 'BaseInput',
  inheritAttrs: false,
  props: baseInputProps(),
  slots: Object as SlotsType<{
    prefix: any
    suffix: any
    clearIcon: any
    addonAfter: any
    addonBefore: any
    default: any
  }>,
  emits: ['update:value', 'change', 'input', 'focus', 'blur', 'clear'],
  setup(props, { slots, attrs, expose }) {
    const containerRef = ref()
    const onInputMouseDown: MouseEventHandler = (e) => {
      if (containerRef.value?.contains(e.target as Element)) {
        const { triggerFocus } = props
        triggerFocus?.()
      }
    }
    const getClearIcon = () => {
      const {
        allowClear,
        value,
        disabled,
        readonly,
        handleReset,
        prefixCls,
      } = props
      if (!allowClear)
        return null

      const needClear = !disabled && !readonly && value
      const className = `${prefixCls}-clear-icon`
      const iconNode = slots.clearIcon?.() || '*'
      return (
        <span
          onClick={handleReset}
          // Do not trigger onBlur when clear input
          onMousedown={e => e.preventDefault()}
          class={classnames(
            {
              [`${className}-hidden`]: !needClear,
              [`${className}-has-suffix`]: !!slots.suffix,
            },
            className,
          )}
          role="button"
          tabindex={-1}
        >
          {iconNode}
        </span>
      )
    }

    expose({
      nativeElement: () => containerRef.value,
    })

    return () => {
      const {
        focused,
        value,
        prefix = slots.prefix?.(),
        suffix = slots.suffix?.(),
        addonAfter = slots.addonAfter,
        addonBefore = slots.addonBefore,
        disabled,
        allowClear,
        readonly,
        hidden,
        prefixCls,
        inputElement: inputEl,
        affixWrapperClassName,
        wrapperClassName,
        groupClassName,
        components,
      } = props
      const inputElement = slots.default?.() || inputEl
      const AffixWrapperComponent = components?.affixWrapper || 'span'
      const GroupWrapperComponent = components?.groupWrapper || 'span'
      const WrapperComponent = components?.wrapper || 'span'
      const GroupAddonComponent = components?.groupAddon || 'span'
      let element = cloneElement(inputElement, {
        value,
        hidden,
      })
      // ================== Prefix & Suffix ================== //
      if (hasPrefixSuffix({ prefix, suffix, allowClear })) {
        const affixWrapperPrefixCls = `${prefixCls}-affix-wrapper`
        const affixWrapperCls = classnames(
          affixWrapperPrefixCls,
          {
            [`${affixWrapperPrefixCls}-disabled`]: disabled,
            [`${affixWrapperPrefixCls}-focused`]: focused,
            [`${affixWrapperPrefixCls}-readonly`]: readonly,
            [`${affixWrapperPrefixCls}-input-with-clear-btn`]: suffix && allowClear && value,
          } as any,
          !hasAddon({ addonAfter, addonBefore }) && attrs.class,
          affixWrapperClassName,
        )

        const suffixNode = (suffix || allowClear) && (
          <span class={`${prefixCls}-suffix`}>
            {getClearIcon()}
            {suffix}
          </span>
        )

        element = (
          <AffixWrapperComponent
            class={affixWrapperCls}
            style={attrs.style as CSSProperties}
            hidden={!hasAddon({ addonAfter, addonBefore }) && hidden}
            onMousedown={onInputMouseDown}
            ref={containerRef}
          >
            {prefix && <span class={`${prefixCls}-prefix`}>{prefix}</span>}
            {cloneElement(inputElement, {
              style: null,
              value,
              hidden: null,
            })}
            {suffixNode}
          </AffixWrapperComponent>
        )
      }
      // ================== Addon ================== //
      if (hasAddon({ addonAfter, addonBefore })) {
        const wrapperCls = `${prefixCls}-group`
        const addonCls = `${wrapperCls}-addon`

        const mergedWrapperClassName = classnames(
          `${prefixCls}-wrapper`,
          wrapperCls,
          wrapperClassName,
        )

        const mergedGroupClassName = classnames(
          `${prefixCls}-group-wrapper` as any,
          attrs.class,
          groupClassName,
        )

        // Need another wrapper for changing display:table to display:inline-block
        // and put style prop in wrapper
        return (
          <GroupWrapperComponent class={mergedGroupClassName} style={attrs.style as CSSProperties} hidden={hidden}>
            <WrapperComponent class={mergedWrapperClassName}>
              {addonBefore && <GroupAddonComponent class={addonCls}>{addonBefore()}</GroupAddonComponent>}
              {cloneElement(element, { style: null, hidden: null })}
              {addonAfter && <GroupAddonComponent class={addonCls}>{addonAfter()}</GroupAddonComponent>}
            </WrapperComponent>
          </GroupWrapperComponent>
        )
      }
      return element
    }
  },
})
