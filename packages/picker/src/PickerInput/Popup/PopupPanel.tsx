import type { PickerPanelProps } from '../../PickerPanel'
import type { PickerHackContextProps } from '../../PickerPanel/context'
import type { FooterProps } from './Footer'
import { computed, defineComponent, toRef, toRefs } from 'vue'
import createPickerPanel from '../../PickerPanel'
import { providePickerHackContext } from '../../PickerPanel/context'
import { usePickerContext } from '../context'
import { offsetPanelDate } from '../hooks/useRangePickerValue'

export type MustProp<DateType extends object> = Required<
  Pick<PickerPanelProps<DateType>, 'mode' | 'onPanelChange'>
>

export type PopupPanelProps<DateType extends object = any>
  = MustProp<DateType>
    & Omit<PickerPanelProps<DateType>, 'onPickerValueChange' | 'showTime'>
    & FooterProps<DateType> & {
      multiplePanel?: boolean
      range?: boolean

      onPickerValueChange: (date: DateType) => void
    }

// provider components
const PickerPanelProvider = defineComponent<{ value: PickerHackContextProps }>({
  name: 'PickerPanelProvider',
  setup(props, { slots }) {
    providePickerHackContext(toRef(props, 'value'))
    return () => {
      return (
        slots.default?.() || null
      )
    }
  },
})

function createPopupPanelComponent<DateType extends object = any>() {
  return defineComponent<PopupPanelProps<DateType>>({
    name: 'PopupPanel',
    inheritAttrs: false,
    setup(props) {
      const ctx = usePickerContext()
      const {
        picker,
        pickerValue,
        needConfirm,
        onSubmit,
        range,
        hoverValue,
        multiplePanel,
        onPickerValueChange,
      } = toRefs(props)

      // ======================== Offset ========================
      const internalOffsetDate = (date: DateType, offset: number) => {
        const { generateConfig } = ctx.value || {}
        return offsetPanelDate(generateConfig, picker.value!, date, offset)
      }

      const nextPickerValue = computed(() => {
        return internalOffsetDate(pickerValue.value!, 1)
      })

      // Outside
      const onSecondPickerValueChange = (nextDate: DateType) => {
        onPickerValueChange.value(internalOffsetDate(nextDate, -1))
      }
      // ======================= Context ========================
      const sharedContext: PickerHackContextProps = {
        onCellDblClick: () => {
          if (needConfirm.value) {
            onSubmit.value()
          }
        },
      }

      const hideHeader = computed(() => picker.value === 'time')

      // ======================== Props =========================
      const pickerProps = computed(() => {
        const baseProps = {
          ...props,
          hoverValue: null as DateType[] | undefined | null,
          hoverRangeValue: null as DateType[] | undefined | null,
          hideHeader: hideHeader.value,
        }

        if (range.value) {
          baseProps.hoverRangeValue = hoverValue.value as any
        }
        else {
          baseProps.hoverValue = hoverValue.value as any
        }

        return baseProps
      })

      return () => {
        // ======================== Render ========================
        const { prefixCls } = ctx.value
        // Multiple
        const PickerPanel = createPickerPanel<DateType>()
        if (multiplePanel.value) {
          return (
            <div class={`${prefixCls}-panels`}>
              <PickerPanelProvider
                value={{
                  ...sharedContext,
                  hideNext: true,
                }}
              >
                <PickerPanel {...pickerProps.value as any} />
              </PickerPanelProvider>
              <PickerPanelProvider
                value={{
                  ...sharedContext,
                  hidePrev: true,
                }}
              >
                <PickerPanel
                  {...pickerProps.value as any}
                  pickerValue={nextPickerValue.value as any}
                  onPickerValueChange={onSecondPickerValueChange}
                />
              </PickerPanelProvider>
            </div>
          )
        }

        // Single
        return (
          <PickerPanelProvider
            value={{
              ...sharedContext,
            }}
          >
            <PickerPanel {...pickerProps.value as any} />
          </PickerPanelProvider>
        )
      }
    },
  })
}

export default createPopupPanelComponent()
