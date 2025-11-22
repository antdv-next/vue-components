import type { KeyboardEventHandler } from '@v-c/util/dist/EventInterface.ts'
import type { VNodeChild } from 'vue'
import useMergedState from '@v-c/util/dist/hooks/useMergedState.ts'
import KeyCode from '@v-c/util/dist/KeyCode'
import { computed, defineComponent, shallowRef } from 'vue'

export type SwitchChangeEventHandler = (
  checked: boolean,
  event: MouseEvent | KeyboardEvent,
) => void
export type SwitchClickEventHandler = SwitchChangeEventHandler
export interface SwitchProps {
  'className'?: string
  'prefixCls'?: string
  'disabled'?: boolean
  'checkedChildren'?: VNodeChild | (() => VNodeChild)
  'unCheckedChildren'?: VNodeChild | (() => VNodeChild)
  'onChange'?: SwitchChangeEventHandler
  'onUpdate:checked'?: (value: boolean) => void
  'onKeyDown'?: KeyboardEventHandler
  'onClick'?: SwitchClickEventHandler
  'tabIndex'?: number
  'checked'?: boolean
  'defaultChecked'?: boolean
  'loadingIcon'?: VNodeChild | (() => VNodeChild)
  'title'?: string
}

const defaults = {
  prefixCls: 'vc-switch',
  defaultChecked: undefined,
  checked: undefined,
} as SwitchProps

const Switch = defineComponent<SwitchProps>(
  (props = defaults, { attrs, expose }) => {
    const btnRef = shallowRef<HTMLButtonElement>()
    const [innerChecked, setInnerChecked] = useMergedState(false, {
      value: computed(() => props.checked),
      defaultValue: props.defaultChecked,
    })

    function triggerChange(
      newChecked: boolean,
      event: MouseEvent | KeyboardEvent,
    ) {
      let mergedChecked = innerChecked.value

      if (!props.disabled) {
        mergedChecked = newChecked
        setInnerChecked(mergedChecked)
        props?.onChange?.(mergedChecked, event)
      }
      props?.['onUpdate:checked']?.(mergedChecked!)

      return mergedChecked
    }

    function onInternalKeyDown(e: KeyboardEvent) {
      if (e.which === KeyCode.LEFT) {
        triggerChange(false, e)
      }
      else if (e.which === KeyCode.RIGHT) {
        triggerChange(true, e)
      }
      props?.onKeyDown?.(e)
    }

    function onInternalClick(e: MouseEvent) {
      const ret = triggerChange(!innerChecked.value, e)
      // [Legacy] trigger onClick with value
      props?.onClick?.(ret!, e)
    }

    expose({
      btnRef,
    })
    return () => {
      const {
        prefixCls,
        className,
        disabled,
        loadingIcon,
        checkedChildren,
        unCheckedChildren,
        ...restProps
      } = props
      const switchClassName = [prefixCls, className, {
        [`${prefixCls}-checked`]: innerChecked.value,
        [`${prefixCls}-disabled`]: disabled,
      }]
      return (
        <button
          {...restProps as any}
          {...attrs}
          type="button"
          role="switch"
          aria-checked={innerChecked.value}
          disabled={disabled}
          class={switchClassName}
          ref={btnRef}
          onKeydown={onInternalKeyDown as any}
          onClick={onInternalClick}
        >
          {loadingIcon}
          <span class={`${prefixCls}-inner`}>
            <span class={`${prefixCls}-inner-checked`}>{checkedChildren}</span>
            <span class={`${prefixCls}-inner-unchecked`}>{unCheckedChildren}</span>
          </span>
        </button>
      )
    }
  },
  {
    name: 'Switch',
  },
)

export default Switch
