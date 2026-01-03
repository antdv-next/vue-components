import type { VueNode } from '@v-c/util'
import type { ComputedRef } from 'vue'
import type { GenerateConfig } from '../../../generate'
import type { Locale, SelectorProps } from '../../../interface'
import { warning } from '@v-c/util'
import { computed } from 'vue'

export interface InputProps {
  'readOnly'?: boolean
  'required'?: boolean
  'aria-required'?: boolean
  'name'?: string
  'autoComplete'?: string
  'size'?: number
  'id'?: string
  'placeholder'?: string
  'disabled'?: boolean
  'onFocus'?: (e: FocusEvent) => void
  'onBlur'?: (e: FocusEvent) => void
  'onKeyDown'?: (e: KeyboardEvent) => void
  'format'?: string
  'validateFormat': (value: string) => boolean
  'active'?: boolean
  /** Used for single picker only */
  'showActiveCls'?: boolean
  'suffixIcon'?: VueNode
  'value'?: string
  'onChange': (value: string) => void
  'onSubmit': VoidFunction
  /** Meaning current is from the hover cell getting the placeholder text */
  'helped'?: boolean
  /**
   * Trigger when input need additional help.
   * Like open the popup for interactive.
   */
  'onHelp': () => void
  'preserveInvalidOnBlur'?: boolean
  'invalid'?: boolean

  'clearIcon'?: VueNode
  [key: string]: any
}

function formatValue<DateType>(
  value: DateType,
  {
    generateConfig,
    locale,
    format,
  }: {
    generateConfig: GenerateConfig<DateType>
    locale: Locale
    format: string | ((value: DateType) => string)
  },
): string {
  if (typeof format === 'function') {
    return format(value)
  }
  return generateConfig.locale.format(locale.locale, value, format) || String(value)
}

function pickAttrs(props: Record<string, any>, { aria, data }: { aria?: boolean, data?: boolean }) {
  const result: Record<string, any> = {}
  Object.keys(props).forEach((key) => {
    if (aria && (key.startsWith('aria-') || key === 'role')) {
      result[key] = props[key]
    }
    if (data && key.startsWith('data-')) {
      result[key] = props[key]
    }
  })
  return result
}

export type UseInputProps<DateType extends object = any> = Pick<
  SelectorProps<DateType>,
  | 'maskFormat'
  | 'format'
  | 'generateConfig'
  | 'locale'
  | 'preserveInvalidOnBlur'
  | 'inputReadOnly'
  | 'onSubmit'
  | 'onFocus'
  | 'onBlur'
  | 'onInputChange'
  | 'onInvalid'
  | 'onOpenChange'
  | 'onKeyDown'
  | 'activeHelp'
  | 'open'
  | 'picker'
> & {
  'id'?: string | string[]
  'value'?: DateType[]
  'invalid'?: boolean | [boolean, boolean]
  'placeholder'?: string | [string, string]
  'disabled'?: boolean | [boolean, boolean]
  'onChange': (value: DateType | null, index?: number) => void

  // Attributes not in SelectorProps directly or omitted
  'required'?: boolean
  'aria-required'?: boolean
  'name'?: string
  'autoComplete'?: string

  // RangePicker only
  'allHelp': boolean
  'activeIndex'?: number | null
}

export default function useInputProps<DateType extends object = any>(
  props: ComputedRef<UseInputProps<DateType>>,
  /** Used for SinglePicker */
  postProps?: (info: { valueTexts: string[] }) => Partial<InputProps>,
) {
  // ======================== Parser ========================
  const parseDate = (str: string, formatStr: string) => {
    const { generateConfig, locale } = props.value
    const parsed = generateConfig.locale.parse(locale.locale, str, [formatStr])
    return parsed && generateConfig.isValidate(parsed) ? parsed : null
  }

  // ========================= Text =========================
  const firstFormat = computed(() => props.value.format[0])

  const getText = (date: DateType) => {
    const { locale, generateConfig } = props.value
    return formatValue(date, { locale, format: firstFormat.value, generateConfig })
  }

  const valueTexts = computed(() => (props.value.value || []).map(getText))

  // ========================= Size =========================
  const size = computed(() => {
    const { picker, generateConfig } = props.value
    const defaultSize = picker === 'time' ? 8 : 10
    const length
      = typeof firstFormat.value === 'function'
        ? firstFormat.value(generateConfig.getNow()).length
        : firstFormat.value.length
    return Math.max(defaultSize, length) + 2
  })

  // ======================= Validate =======================
  const validateFormat = (text: string) => {
    const { format } = props.value
    for (let i = 0; i < format.length; i += 1) {
      const singleFormat = format[i]

      // Only support string type
      if (typeof singleFormat === 'string') {
        const parsed = parseDate(text, singleFormat)

        if (parsed) {
          return parsed
        }
      }
    }

    return false
  }

  // ======================== Input =========================
  const getInputProps = (index?: number): InputProps => {
    function getProp<T>(propValue: T | T[]): T {
      return index !== undefined ? (propValue as T[])[index] : (propValue as T)
    }

    const pickedAttrs = pickAttrs(props.value, { aria: true, data: true })

    const {
      maskFormat,
      preserveInvalidOnBlur,
      inputReadOnly,
      required,
      'aria-required': ariaRequired,
      name,
      autoComplete,
      id,
      invalid,
      placeholder,
      activeHelp,
      activeIndex,
      allHelp,
      disabled,
      onFocus,
      onBlur,
      onSubmit,
      onInputChange,
      onInvalid,
      onChange,
      onOpenChange,
      onKeyDown,
      open,
    } = props.value

    const inputProps: InputProps = {
      ...pickedAttrs,

      // ============== Shared ==============
      'format': maskFormat,
      'validateFormat': (text: string) => !!validateFormat(text),
      preserveInvalidOnBlur,

      'readOnly': inputReadOnly,

      required,
      'aria-required': ariaRequired,

      name,

      autoComplete,

      'size': size.value,

      // ============= By Index =============
      'id': getProp(id),

      'value': getProp(valueTexts.value) || '',

      'invalid': getProp(invalid),

      'placeholder': getProp(placeholder),

      'active': activeIndex === index,

      'helped': allHelp || (activeHelp && activeIndex === index),

      'disabled': getProp(disabled),

      'onFocus': (event) => {
        onFocus(event, index)
      },
      'onBlur': (event) => {
        // Blur do not trigger close
        // Since it may focus to the popup panel
        onBlur(event, index)
      },

      onSubmit,

      // Get validate text value
      'onChange': (text: string) => {
        onInputChange()

        const parsed = validateFormat(text)

        if (parsed) {
          onInvalid(false, index)
          onChange(parsed, index)
          return
        }

        // Tell outer that the value typed is invalid.
        // If text is empty, it means valid.
        onInvalid(!!text, index)
      },
      'onHelp': () => {
        onOpenChange(true, { index })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        let prevented = false

        onKeyDown?.(event, () => {
          if (process.env.NODE_ENV !== 'production') {
            warning(
              false,
              '`preventDefault` callback is deprecated. Please call `event.preventDefault` directly.',
            )
          }
          prevented = true
        })

        if (!event.defaultPrevented && !prevented) {
          switch (event.key) {
            case 'Escape':
              onOpenChange(false, { index })
              break
            case 'Enter':
              if (!open) {
                onOpenChange(true)
              }
              break
          }
        }
      },

      // ============ Post Props ============
      ...postProps?.({ valueTexts: valueTexts.value }),
    }

    // ============== Clean Up ==============
    Object.keys(inputProps).forEach((key) => {
      if (inputProps[key] === undefined) {
        delete inputProps[key]
      }
    })

    return inputProps
  }

  return [getInputProps, getText] as const
}
