import type { ComponentsConfig } from '../hooks/useComponents'
import type { DisplayValueType, Mode, RenderNode } from '../interface'
import { clsx } from '@v-c/util'
import useEvent from '@v-c/util/dist/hooks/useEvent'
import KeyCode from '@v-c/util/dist/KeyCode'
import omit from '@v-c/util/dist/omit'
import { cloneVNode, computed, defineComponent, isVNode, shallowRef } from 'vue'
import useBaseProps from '../hooks/useBaseProps'
import { isValidateOpenKey } from '../utils/keyUtil'
import Affix from './Affix'
import SelectContent from './Content'
import { useProvideSelectInputContext } from './context'

export interface SelectInputRef {
  focus: (options?: FocusOptions) => void
  blur: () => void
  nativeElement: HTMLDivElement
}

export interface SelectInputProps {
  prefixCls: string
  prefix?: any
  suffix?: any
  clearIcon?: any
  removeIcon?: RenderNode
  multiple?: boolean
  displayValues: DisplayValueType[]
  placeholder?: any
  searchValue?: string
  activeValue?: string
  mode?: Mode
  autoClearSearchValue?: boolean
  onSearch?: (searchText: string, fromTyping: boolean, isCompositing: boolean) => void
  onSearchSubmit?: (searchText: string) => void
  onInputBlur?: () => void
  onClearMouseDown?: (event: MouseEvent) => void
  onInputKeyDown?: (event: KeyboardEvent) => void
  onSelectorRemove?: (value: DisplayValueType) => void
  maxLength?: number
  autoFocus?: boolean
  tokenWithEnter?: boolean
  className?: string
  style?: any
  focused?: boolean
  components: ComponentsConfig
  children?: any
  tabIndex?: number
  role?: string
  onMouseDown?: (event: MouseEvent) => void
  onBlur?: (event: FocusEvent) => void
}

const DEFAULT_OMIT_PROPS = [
  'value',
  'onChange',
  'removeIcon',
  'placeholder',
  'maxTagCount',
  'maxTagTextLength',
  'maxTagPlaceholder',
  'choiceTransitionName',
  'onInputKeyDown',
  'onPopupScroll',
  'tabIndex',
  'activeValue',
  'onSelectorRemove',
  'focused',
] as const

const SelectInput = defineComponent<SelectInputProps>(
  (props, { expose, slots, attrs }) => {
    const baseProps = useBaseProps()

    // 从 baseProps 中获取响应式值
    const triggerOpen = computed(() => baseProps.value?.triggerOpen)
    const toggleOpen = computed(() => baseProps.value?.toggleOpen)
    const showSearch = computed(() => baseProps.value?.showSearch)
    const disabled = computed(() => baseProps.value?.disabled)
    const loading = computed(() => baseProps.value?.loading)
    const classNames = computed(() => baseProps.value?.classNames)
    const styles = computed(() => baseProps.value?.styles)

    const rootRef = shallowRef<HTMLDivElement>()
    const inputRef = shallowRef<HTMLInputElement>()

    const onInternalInputKeyDown = (event: KeyboardEvent) => {
      const { which } = event
      const isTextAreaElement = inputRef.value instanceof HTMLTextAreaElement

      if (!isTextAreaElement && triggerOpen.value && (which === KeyCode.UP || which === KeyCode.DOWN)) {
        event.preventDefault()
      }

      if (props.onInputKeyDown) {
        props.onInputKeyDown(event)
      }

      if (
        isTextAreaElement
        && !triggerOpen.value
        && ~[KeyCode.UP, KeyCode.DOWN, KeyCode.LEFT, KeyCode.RIGHT].indexOf(which)
      ) {
        return
      }

      if (isValidateOpenKey(which)) {
        toggleOpen.value?.(true)
      }
    }

    expose({
      focus: (options?: FocusOptions) => {
        ;(inputRef.value || rootRef.value)?.focus?.(options)
      },
      blur: () => {
        ;(inputRef.value || rootRef.value)?.blur?.()
      },
      nativeElement: rootRef.value as any,
    } as SelectInputRef)

    const onInternalMouseDown = useEvent((event: MouseEvent) => {
      if (!disabled.value) {
        if (event.target !== (inputRef.value as any)) {
          event.preventDefault()
        }

        const shouldPreventClose = triggerOpen.value && !props.multiple && (props.mode === 'combobox' || showSearch.value)

        if (!(event as any).nativeEvent?._select_lazy) {
          inputRef.value?.focus()
          if (!shouldPreventClose) {
            toggleOpen.value?.()
          }
        }
        else if (triggerOpen.value) {
          toggleOpen.value?.(false)
        }
      }
      props.onMouseDown?.(event)
    })

    const onInternalBlur = (event: FocusEvent) => {
      toggleOpen.value?.(false)
      props.onBlur?.(event)
    }

    const RootComponent: any = (props.components || {}).root
    const domProps = omit(
      {
        ...attrs,
        ...props,
      },
      DEFAULT_OMIT_PROPS as any,
    )

    const contextValue = computed(() => ({
      ...props,
      ...attrs,
      onInputKeyDown: onInternalInputKeyDown,
    })) as any

    if (RootComponent) {
      if (isVNode(RootComponent)) {
        return () => cloneVNode(RootComponent, { ...domProps, ref: rootRef })
      }
      return () => <RootComponent {...(domProps as any)} ref={rootRef} />
    }

    useProvideSelectInputContext(contextValue)

    return () => {
      return (
        <div
          {...(domProps as any)}
          ref={rootRef}
          class={props.className}
          style={props.style}
          onMousedown={onInternalMouseDown as any}
          onBlur={onInternalBlur as any}
        >
          <Affix className={clsx(`${props.prefixCls}-prefix`, classNames.value?.prefix)} style={styles.value?.prefix}>
            {props.prefix}
          </Affix>
          <SelectContent ref={inputRef as any} />
          <Affix
            className={clsx(
              `${props.prefixCls}-suffix`,
              {
                [`${props.prefixCls}-suffix-loading`]: loading.value,
              },
              classNames.value?.suffix,
            )}
            style={styles.value?.suffix}
          >
            {props.suffix}
          </Affix>
          {props.clearIcon && (
            <Affix
              className={clsx(`${props.prefixCls}-clear`, classNames.value?.clear)}
              style={styles.value?.clear}
              onMouseDown={(e) => {
                ;(e as any).nativeEvent._select_lazy = true
                props.onClearMouseDown?.(e as any)
              }}
            >
              {props.clearIcon}
            </Affix>
          )}
          {slots.default?.()}
        </div>
      )
    }
  },
)

export default SelectInput
