import type { PanelMode } from '../../interface'
import type { PickerPanelProps } from '../../PickerPanel'
import type { PickerHackContextProps } from '../../PickerPanel/context'
import type { FooterProps } from './Footer'
import { computed, defineComponent } from 'vue'
import PickerPanel from '../../PickerPanel'
import { providePickerHackContext } from '../../PickerPanel/context'
import { usePickerContext } from '../context'
import { offsetPanelDate } from '../hooks/useRangePickerValue'

export type MustProp<DateType extends object> = Required<
  Pick<PickerPanelProps<DateType>, 'mode' | 'onPanelChange'>
>

type PopupPanelPropsWrapper<DateType extends object = any>
  = MustProp<DateType>
    & Omit<PickerPanelProps<DateType>, 'onPickerValueChange' | 'showTime'>
    & FooterProps<DateType>

export interface PopupPanelProps<DateType extends object = any> extends PopupPanelPropsWrapper<DateType> {
  multiplePanel?: boolean
  range?: boolean
  onPickerValueChange: (date: DateType) => void
}

// provider components
const PickerPanelProvider = defineComponent<{ value: PickerHackContextProps }>(
  (props, { slots }) => {
    providePickerHackContext(computed(() => props.value) as any)
    return () => {
      return slots.default?.()
    }
  },
  {
    name: 'PickerPanelProvider',
    inheritAttrs: false,
  },
)

const PopupPanel = defineComponent<PopupPanelProps>(
  (props) => {
    const ctx = usePickerContext()

    const picker = computed(() => props.picker)
    const pickerValue = computed(() => props.pickerValue)
    const needConfirm = computed(() => props.needConfirm)
    const onSubmit = computed(() => props.onSubmit)
    const range = computed(() => props.range)
    const hoverValue = computed(() => props.hoverValue)
    const multiplePanel = computed(() => props.multiplePanel)
    const onPickerValueChange = computed(() => props.onPickerValueChange)

    // ======================== Offset ========================
    const internalOffsetDate = (date: any, offset: number) => {
      const { generateConfig } = ctx.value || {}
      return offsetPanelDate(generateConfig, picker?.value as PanelMode, date, offset)
    }

    const nextPickerValue = computed(() => {
      return internalOffsetDate(pickerValue?.value, 1)
    })

    // Outside
    const onSecondPickerValueChange = (nextDate: any) => {
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

    const hideHeader = computed(() => picker?.value === 'time')

    // ======================== Props =========================
    const pickerProps = computed(() => {
      const baseProps = {
        ...props,
        hoverValue: null as any[] | undefined | null,
        hoverRangeValue: null as any[] | undefined | null,
        hideHeader: hideHeader.value,
      }

      if (range?.value) {
        baseProps.hoverRangeValue = hoverValue?.value as any
      }
      else {
        baseProps.hoverValue = hoverValue?.value as any
      }
      return baseProps
    })

    return () => {
    // ======================== Render ========================
      const { prefixCls } = ctx.value
      // Multiple
      if (multiplePanel?.value) {
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
  {
    name: 'PopupPanel',
    inheritAttrs: false,
  },
)

export default PopupPanel
