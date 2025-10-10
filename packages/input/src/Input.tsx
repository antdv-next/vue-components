import type { ChangeEvent, FocusEventHandler } from '@v-c/util/dist/EventInterface'
// base 0.0.1-alpha.7
import type { ComponentPublicInstance, Directive, SlotsType, VNode } from 'vue'
import type { InputProps } from './interface'
import type { InputFocusOptions } from './utils/commonUtils'
import omit from '@v-c/util/dist/omit'
import { classNames as classnames } from '@v-c/util'
import { defineComponent, nextTick, onMounted, ref, shallowRef, watch, withDirectives } from 'vue'
// import antInputDirective from '@v-c/util/dist/antInputDirective';
import BaseInput from './BaseInput'
import useCount from './hooks/useCount'
import { inputProps } from './interface'

import {
  fixControlledValue,
  hasAddon,
  hasPrefixSuffix,
  resolveOnChange,
  triggerFocus,
} from './utils/commonUtils'

function onCompositionStart(e: any) {
  e.target.composing = true
}

function onCompositionEnd(e: any) {
  // prevent triggering an input event for no reason
  if (!e.target.composing)
    return
  e.target.composing = false
  trigger(e.target, 'input')
}

function trigger(el: any, type: any) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(type, true, true)
  el.dispatchEvent(e)
}

function addEventListener(
  el: HTMLElement,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  el.addEventListener(event, handler, options)
}
const antInput: Directive = {
  created(el, binding) {
    if (!binding.modifiers || !binding.modifiers.lazy) {
      addEventListener(el, 'compositionstart', onCompositionStart)
      addEventListener(el, 'compositionend', onCompositionEnd)
      // Safari < 10.2 & UIWebView doesn't fire compositionend when
      // switching focus before confirming composition choice
      // this also fixes the issue where some browsers e.g. iOS Chrome
      // fires "change" instead of "input" on autocomplete.
      addEventListener(el, 'change', onCompositionEnd)
    }
  },
}

export default defineComponent({
  name: 'VCInput',
  inheritAttrs: false,
  props: inputProps(),
  slots: Object as SlotsType<{
    prefix: any
    suffix: any
    clearIcon: any
    addonAfter: any
    addonBefore: any
  }>,
  setup(props, { slots, attrs, expose, emit }) {
    const stateValue = shallowRef(props.value === undefined ? props.defaultValue : props.value)
    const focused = shallowRef(false)
    const inputRef = shallowRef<HTMLInputElement>()
    const rootRef = shallowRef<ComponentPublicInstance>()
    watch(
      () => props.value,
      () => {
        stateValue.value = props.value
      },
    )
    watch(
      () => props.disabled,
      () => {
        if (props.disabled)
          focused.value = false
      },
    )
    const focus = (option?: InputFocusOptions) => {
      if (inputRef.value)
        triggerFocus(inputRef.value, option)
    }

    const blur = () => {
      inputRef.value?.blur()
    }

    const setSelectionRange = (
      start: number,
      end: number,
      direction?: 'forward' | 'backward' | 'none',
    ) => {
      inputRef.value?.setSelectionRange(start, end, direction)
    }

    const select = () => {
      inputRef.value?.select()
    }

    // ====================== Count =======================
    const countConfig = ref()
    watch([() => props.count, () => props.showCount], () => {
      countConfig.value = useCount(props.count, props.showCount)
    }, { immediate: true })
    expose({
      focus,
      blur,
      input: inputRef,
      stateValue,
      setSelectionRange,
      select,
    })
    const triggerChange = (e: Event) => {
      emit('change', e)
    }
    const setValue = (value: string | number, callback?: Function) => {
      if (stateValue.value === value)
        return

      if (props.value === undefined) {
        stateValue.value = value
      }
      else {
        nextTick(() => {
          if (inputRef.value?.value !== stateValue.value)
            rootRef.value?.$forceUpdate()
        })
      }
      nextTick(() => {
        callback && callback()
      })
    }
    const handleChange = (e: ChangeEvent) => {
      const { value, composing } = e.target as any
      // https://github.com/vueComponent/ant-design-vue/issues/2203
      if ((((e as any).isComposing || composing) && props.lazy) || stateValue.value === value)
        return
      const newVal = e.target.value
      resolveOnChange(inputRef.value!, e, triggerChange)
      setValue(newVal!)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.keyCode === 13)
        emit('pressEnter', e)

      emit('keydown', e)
    }

    const handleFocus: FocusEventHandler = (e) => {
      focused.value = true
      emit('focus', e)
    }

    const handleBlur: FocusEventHandler = (e) => {
      focused.value = false
      emit('blur', e)
    }

    const handleReset = (e: MouseEvent) => {
      resolveOnChange(inputRef.value!, e, triggerChange)
      setValue('', () => {
        focus()
      })
    }

    const getInputElement = () => {
      const {
        addonBefore = slots.addonBefore,
        addonAfter = slots.addonAfter,
        disabled,
        valueModifiers = {},
        htmlSize,
        autocomplete,
        prefixCls,
        inputClassName,
        prefix = slots.prefix?.(),
        suffix = slots.suffix?.(),
        allowClear,
        type = 'text',
      } = props
      const otherProps = omit(props as InputProps & { placeholder: string }, [
        'prefixCls',
        'onPressEnter',
        'addonBefore',
        'addonAfter',
        'prefix',
        'suffix',
        'allowClear',
        // Input elements must be either controlled or uncontrolled,
        // specify either the value prop, or the defaultValue prop, but not both.
        'defaultValue',
        'size',
        'bordered',
        'htmlSize',
        'lazy',
        'showCount',
        'valueModifiers',
        'affixWrapperClassName',
        'groupClassName',
        'inputClassName',
        'wrapperClassName',
      ])
      const inputProps = {
        ...otherProps,
        ...attrs,
        autocomplete,
        onChange: handleChange,
        onInput: handleChange,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onKeydown: handleKeyDown,
        class: classnames(
          prefixCls,
          {
            [`${prefixCls}-disabled`]: disabled,
          } as any,
          inputClassName,
          !hasAddon({ addonAfter, addonBefore })
          && !hasPrefixSuffix({ prefix, suffix, allowClear })
          && attrs.class,
        ),
        ref: inputRef,
        key: 'ant-input',
        size: htmlSize,
        type,
      }
      if (valueModifiers.lazy)
        delete (inputProps as any).onInput

      if (!inputProps.autofocus)
        delete inputProps.autofocus

      const inputNode = <input {...omit(inputProps, ['size']) as any} />
      return withDirectives(inputNode as VNode, [[antInput]])
    }
    const getSuffix = () => {
      const { maxLength, suffix = slots.suffix?.(), prefixCls } = props
      // Max length value
      const hasMaxLength = Number(maxLength) > 0
      if (suffix || countConfig.value.show) {
        const mergedMax = countConfig.value.max || props.maxLength
        const valueLength = [...fixControlledValue(stateValue.value!)].length
        const dataCount
          = countConfig.value.showFormatter
            ? countConfig.value.showFormatter({
                value: stateValue.value,
                count: valueLength,
                maxLength: mergedMax,
              })
            : `${valueLength}${hasMaxLength ? ` / ${mergedMax}` : ''}`
        return (
          <>
            {countConfig.value.show && (
              <span
                class={classnames(`${prefixCls}-show-count-suffix`, {
                  [`${prefixCls}-show-count-has-suffix`]: !!suffix,
                })}
              >
                {dataCount}
              </span>
            )}
            {suffix}
          </>
        )
      }
      return null
    }
    onMounted(() => {
      if (process.env.NODE_ENV === 'test') {
        if (props.autofocus)
          focus()
      }
    })
    return () => {
      const { prefixCls, disabled, ...rest } = props
      return (
        <BaseInput
          {...rest}
          {...attrs}
          ref={rootRef}
          prefixCls={prefixCls}
          inputElement={getInputElement()}
          handleReset={handleReset}
          value={fixControlledValue(stateValue.value as any)}
          focused={focused.value}
          triggerFocus={focus}
          suffix={getSuffix()}
          disabled={disabled}
          v-slots={slots}
        />
      )
    }
  },
})
