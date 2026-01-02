import type { GenerateConfig } from '../../generate'
import type { DisabledDate, SharedPanelProps } from '../../interface'
import { computed, defineComponent } from 'vue'
import { formatValue } from '../../utils/dateUtil'
import { providePanelContext, useInfo } from '../context'
import PanelBody from '../PanelBody'
import PanelHeader from '../PanelHeader'

const MonthPanel = defineComponent<SharedPanelProps>(
  (props: SharedPanelProps) => {
    const panelContext = computed(() => {
      const [info] = useInfo(props as any, 'month')
      return info
    })

    providePanelContext(panelContext)

    return () => {
      const {
        prefixCls,
        locale = {} as any,
        generateConfig = {} as GenerateConfig<any>,
        pickerValue,
        disabledDate,
        onPickerValueChange,
        onModeChange,
      } = props

      const panelPrefixCls = `${prefixCls}-month-panel`
      const baseDate = generateConfig.setMonth(pickerValue, 0)
      const yearFormat = locale.yearFormat || 'YYYY'

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
            onModeChange?.('year')
          }}
          tabindex={-1}
          class={`${prefixCls}-year-btn`}
        >
          {formatValue(pickerValue, {
            locale,
            format: yearFormat,
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
  {
    name: 'MonthPanel',
    inheritAttrs: false,
  },
)

export default MonthPanel
