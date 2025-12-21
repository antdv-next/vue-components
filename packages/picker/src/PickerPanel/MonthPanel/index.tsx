import type { PropType } from 'vue'
import type { DisabledDate, PanelMode } from '../../interface'
import { computed, defineComponent } from 'vue'
import { formatValue } from '../../utils/dateUtil'
import { providePanelContext, useInfo } from '../context'
import PanelBody from '../PanelBody'
import PanelHeader from '../PanelHeader'

export default defineComponent({
  name: 'MonthPanel',
  inheritAttrs: false,
  props: {
    prefixCls: String,
    locale: Object as PropType<any>,
    generateConfig: Object as PropType<any>,
    pickerValue: Object as PropType<any>,
    onPickerValueChange: Function as PropType<(date: any) => void>,
    onModeChange: Function as PropType<(mode: PanelMode, date?: any) => void>,
    disabledDate: Function as PropType<any>,
    onSelect: Function as PropType<(date: any) => void>,
    onHover: Function as PropType<(date: any) => void>,
    // Other SharedPanelProps
    minDate: Object as PropType<any>,
    maxDate: Object as PropType<any>,
    cellRender: Function as PropType<any>,
    hoverRangeValue: Array as PropType<any>,
    hoverValue: Array as PropType<any>,
    values: Array as PropType<any>,
    showTime: [Boolean, Object] as PropType<any>,
    prevIcon: Object as PropType<any>,
    nextIcon: Object as PropType<any>,
    superPrevIcon: Object as PropType<any>,
    superNextIcon: Object as PropType<any>,
  },
  setup(props) {
    const panelContext = computed(() => {
      const [info] = useInfo(props, 'month')
      return info
    })

    providePanelContext(panelContext)

    return () => {
      const {
        prefixCls,
        locale,
        generateConfig,
        pickerValue,
        disabledDate,
        onPickerValueChange,
        onModeChange,
      } = props

      const panelPrefixCls = `${prefixCls}-month-panel`
      const baseDate = generateConfig.setMonth(pickerValue, 0)

      const monthsLocale
        = locale.shortMonths
          || (generateConfig.locale.getShortMonths
            ? generateConfig.locale.getShortMonths(locale.locale)
            : [])

      const getCellDate = (date: any, offset: number) => {
        return generateConfig.addMonth(date, offset)
      }

      const getCellText = (date: any) => {
        const month = generateConfig.getMonth(date)

        return locale.monthFormat
          ? formatValue(date, {
              locale,
              format: locale.monthFormat,
              generateConfig,
            })
          : monthsLocale[month]
      }

      const getCellClassName = () => ({
        [`${prefixCls}-cell-in-view`]: true,
      })

      const mergedDisabledDate: DisabledDate<any> | undefined = disabledDate
        ? (currentDate, disabledInfo) => {
            const startDate = generateConfig.setDate(currentDate, 1)
            const nextMonthStartDate = generateConfig.setMonth(
              startDate,
              generateConfig.getMonth(startDate) + 1,
            )
            const endDate = generateConfig.addDate(nextMonthStartDate, -1)

            return disabledDate(startDate, disabledInfo) && disabledDate(endDate, disabledInfo)
          }
        : undefined

      const yearNode = (
        <button
          type="button"
          key="year"
          aria-label={locale.yearSelect}
          onClick={() => {
            onModeChange('year')
          }}
          tabindex={-1}
          class={`${prefixCls}-year-btn`}
        >
          {formatValue(pickerValue, {
            locale,
            format: locale.yearFormat,
            generateConfig,
          })}
        </button>
      )

      return (
        <div class={panelPrefixCls}>
          <PanelHeader
            superOffset={(distance: number, date: any) => generateConfig.addYear(date, distance)}
            onChange={onPickerValueChange}
            getStart={(date: any) => generateConfig.setMonth(date, 0)}
            getEnd={(date: any) => generateConfig.setMonth(date, 11)}
          >
            {yearNode}
          </PanelHeader>

          <PanelBody
            {...props}
            disabledDate={mergedDisabledDate}
            titleFormat={locale.fieldMonthFormat}
            colNum={3}
            rowNum={4}
            baseDate={baseDate}
            getCellDate={getCellDate}
            getCellText={getCellText}
            getCellClassName={getCellClassName}
          />
        </div>
      )
    }
  },
})
