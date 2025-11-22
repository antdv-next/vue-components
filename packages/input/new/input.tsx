import type { InputFocusOptions } from '@v-c/util/dist/Dom/focus'
import type { HolderRef } from './BaseInput'
import type { InputProps } from './interface'
import { triggerFocus } from '@v-c/util/dist/Dom/focus'
import { toPropsRefs } from '@v-c/util/dist/props-util'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import useCount from './hooks/useCount.ts'

const defaults = {
  prefixCls: 'vc-input',
  type: 'text',
} as any
const Input = defineComponent<
  InputProps
>(
  (props = defaults, { slots, emit, expose, attrs }) => {
    const focused = shallowRef(false)
    const compositionRef = shallowRef(false)
    const keyLockRef = shallowRef(false)
    const { count, showCount } = toPropsRefs(props, 'count', 'showCount')

    const inputRef = shallowRef<HTMLInputElement>()
    const holderRef = shallowRef<HolderRef>()

    const focus = (option?: InputFocusOptions) => {
      if (inputRef.value) {
        triggerFocus(inputRef.value, option)
      }
    }

    // ====================== Value =======================
    const value = shallowRef(props?.value ?? props?.defaultValue)
    watch(
      () => props.value,
      () => {
        value.value = props?.value
      },
    )
    const formatValue = computed(() => value.value === undefined || value.value === null ? '' : String(value.value))

    // =================== Select Range ===================
    const selection = shallowRef<[start: number, end: number] | null>(null)

    // ====================== Count =======================
    const countConfig = useCount(count as any, showCount)
    const mergedMax = computed(() => countConfig?.value?.max || props?.maxLength)
    const valueLength = computed(() => countConfig.value?.strategy?.(formatValue.value))

    const isOutOfRange = computed(() => !!mergedMax.value && valueLength.value > mergedMax.value)

    // ======================= Ref ========================
    expose({
      focus,
      blur: () => {
        inputRef.value?.blur?.()
      },
      setSelectionRange: (
        start: number,
        end: number,
        direction?: 'forward' | 'backward' | 'none',
      ) => {
        inputRef.value?.setSelectionRange(start, end, direction)
      },
      select: () => {
        inputRef.value?.select()
      },
      input: inputRef,
      nativeElement: computed(() => holderRef.value?.nativeElement || inputRef.value),
    })

    watch(
      () => props.disabled,
      () => {
        if (keyLockRef.value) {
          keyLockRef.value = false
        }
        focused.value = focused.value && props.disabled ? false : focused.value
      },
      {
        immediate: true,
      },
    )
    return () => {
      return null
    }
  },
  {
    name: 'Input',
    inheritAttrs: false,
  },
)

export default Input
