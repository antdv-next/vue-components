import type { ResizeObserverProps } from '@v-c/resize-observer'
import type { MouseEventHandler } from '@v-c/util/dist/EventInterface'
import type { VueNode } from '@v-c/util/dist/type'
import type { InputHTMLAttributes } from 'vue'
import type { RangeTimeProps, SharedPickerProps, SharedTimeProps, ValueDate } from '../../interface'

import type { FooterProps } from './Footer'
import type { PopupPanelProps } from './PopupPanel'
import ResizeObserver from '@v-c/resize-observer'
import { clsx, omit } from '@v-c/util'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { toArray } from '../../utils/miscUtil'
import { usePickerContext } from '../context'
import Footer from './Footer'
import PopupPanel from './PopupPanel'
import PresetPanel from './PresetPanel'

export type PopupShowTimeConfig<DateType extends object = any> = Omit<
  RangeTimeProps<DateType>,
  'defaultValue' | 'defaultOpenValue' | 'disabledTime'
>
& Pick<SharedTimeProps<DateType>, 'disabledTime'>

export type PopupProps<DateType extends object = any, PresetValue = DateType>
  = Pick<InputHTMLAttributes, 'onFocus' | 'onBlur'>
    & FooterProps<DateType>
    & PopupPanelProps<DateType>
    & {
      panelRender?: SharedPickerProps['panelRender']

      presets: ValueDate<PresetValue>[]
      onPresetHover: (presetValue: PresetValue | null) => void
      onPresetSubmit: (presetValue: PresetValue) => void

      activeInfo?: [activeInputLeft: number, activeInputRight: number, selectorWidth: number]
      direction?: 'ltr' | 'rtl'

      defaultOpenValue: DateType

      needConfirm: boolean | undefined
      isInvalid: (date: DateType | DateType[]) => boolean
      onOk: VoidFunction

      onPanelMouseDown?: MouseEventHandler

      classNames?: SharedPickerProps['classNames']
      styles?: SharedPickerProps['styles']
    }

//
const Popup = defineComponent<PopupProps>(
  (props) => {
    const activeInfo = computed(() => props.activeInfo || [0, 0, 0])

    const ctx = usePickerContext()
    const panelPrefixCls = computed(() => `${ctx.value.prefixCls}-panel`)

    const rtl = computed(() => props.direction === 'rtl')

    // ========================= Refs =========================
    const arrowRef = ref<HTMLDivElement>()
    const wrapperRef = ref<HTMLDivElement>()

    // ======================== Offset ========================
    const containerWidth = ref<number>(0)
    const containerOffset = ref<number>(0)
    const arrowOffset = ref<number>(0)

    const onResize: ResizeObserverProps['onResize'] = (info) => {
      if (info.width) {
        containerWidth.value = info.width
      }
    }

    const retryTimes = ref(0)

    onMounted(() => {
      watch(() => activeInfo.value[0], () => {
        retryTimes.value = 10
      }, { immediate: true })

      watch(() => [retryTimes.value, rtl.value, activeInfo.value, props.range], () => {
      // `activeOffset` is always align with the active input element
        // So we need only check container contains the `activeOffset`
        const [activeInputLeft, activeInputRight, selectorWidth] = activeInfo.value
        if (props.range && wrapperRef.value) {
          // Offset in case container has border radius
          const arrowWidth = arrowRef.value?.offsetWidth || 0

          // Arrow Offset
          const wrapperRect = wrapperRef.value.getBoundingClientRect()
          if (!wrapperRect.height || wrapperRect.right < 0) {
            retryTimes.value = Math.max(0, retryTimes.value - 1)
            return
          }

          const nextArrowOffset
            = (rtl ? activeInputRight - arrowWidth : activeInputLeft) - wrapperRect.left
          arrowOffset.value = nextArrowOffset

          // Container Offset
          if (containerWidth && containerWidth.value < selectorWidth) {
            const offset = rtl
              ? wrapperRect.right - (activeInputRight - arrowWidth + containerWidth.value)
              : activeInputLeft + arrowWidth - wrapperRect.left - containerWidth.value

            const safeOffset = Math.max(0, offset)
            containerOffset.value = safeOffset
          }
          else {
            containerOffset.value = 0
          }
        }
      }, { immediate: true })
    })

    // ======================== Custom ========================
    function filterEmpty<T>(list: T[]) {
      return list.filter(item => item)
    }

    const valueList = computed(() => filterEmpty(toArray(props.value)))

    const isTimePickerEmptyValue = computed(() => props.picker === 'time' && !valueList.value.length)

    const footerSubmitValue = computed(() => {
      if (isTimePickerEmptyValue.value) {
        return filterEmpty([props.defaultOpenValue])
      }
      return valueList.value
    })

    const popupPanelValue = computed(() => isTimePickerEmptyValue.value ? props.defaultOpenValue : valueList.value)

    const disableSubmit = computed(() => {
    // Empty is invalid
      if (!footerSubmitValue.value.length) {
        return true
      }

      return footerSubmitValue.value.some(val => props.isInvalid(val!))
    })

    const onFooterSubmit = () => {
    // For TimePicker, we will additional trigger the value update
      if (isTimePickerEmptyValue.value) {
        props.onSelect?.(props.defaultOpenValue)
      }

      props.onOk()
      props.onSubmit()
    }

    // ======================== Render ========================
    return () => {
      const {
        classNames,
        panelRender,
        multiple,
        showNow,
        picker,
        range,
        presets,
        onPresetSubmit,
        onPresetHover,
        internalMode,
        styles,
        onFocus,
        onBlur,
        onPanelMouseDown,
      } = props

      const onPanelFocusIn = (event: FocusEvent) => {
        onFocus?.(event)
      }

      const onPanelFocusOut = (event: FocusEvent) => {
        onBlur?.(event)
      }

      const prefixCls = ctx.value.prefixCls
      let mergedNodes: VueNode = (
        <div class={`${prefixCls}-panel-layout`}>
          {/* `any` here since PresetPanel is reused for both Single & Range Picker which means return type is not stable */}
          <PresetPanel
            prefixCls={prefixCls}
            presets={presets}
            onClick={onPresetSubmit}
            onHover={onPresetHover}
          />
          <div>
            <PopupPanel {...props} value={popupPanelValue.value} />
            <Footer
              {...omit(props, ['onSubmit'])}
              showNow={multiple ? false : showNow}
              invalid={disableSubmit.value}
              onSubmit={onFooterSubmit}
            />
          </div>
        </div>
      )

      if (panelRender) {
        mergedNodes = panelRender(mergedNodes)
      }

      const containerPrefixCls = `${panelPrefixCls.value}-container`

      const marginLeft = 'marginLeft'
      const marginRight = 'marginRight'

      // Container
      let renderNode = (
        <div
          onMousedown={onPanelMouseDown}
          tabindex={-1}
          class={clsx(
            containerPrefixCls,
            // Used for Today Button style, safe to remove if no need
            `${ctx.value.prefixCls}-${internalMode}-panel-container`,
            classNames?.popup?.container,
          )}
          style={{
            [rtl ? marginRight : marginLeft]: containerOffset,
            [rtl ? marginLeft : marginRight]: 'auto',
            ...styles?.popup?.container,
          }}
          // Still wish not to lose focus on mouse down
          // onMouseDown={(e) => {
          //   // e.preventDefault();
          // }}
          onFocusin={onPanelFocusIn}
          onFocusout={onPanelFocusOut}
        >
          {mergedNodes}
        </div>
      )
      if (range) {
        renderNode = (
          <div
            onMousedown={onPanelMouseDown}
            ref={wrapperRef}
            class={clsx(`${ctx.value.prefixCls}-range-wrapper`, `${ctx.value.prefixCls}-${picker}-range-wrapper`)}
          >
            <div ref={arrowRef} class={`${ctx.value.prefixCls}-range-arrow`} style={{ left: `${arrowOffset.value}px` }} />

            {/* Watch for container size */}
            <ResizeObserver onResize={onResize}>{renderNode}</ResizeObserver>
          </div>
        )
      }

      return renderNode
    }
  },
  {
    name: 'Popup',
    inheritAttrs: false,
  },
)

export default Popup
