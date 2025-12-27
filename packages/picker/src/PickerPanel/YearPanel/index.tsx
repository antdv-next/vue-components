import type { PropType } from 'vue'
import type { DisabledDate, PanelMode } from '../../interface'
import { computed, defineComponent } from 'vue'
import { formatValue, isInRange, isSameYear } from '../../utils/dateUtil'
import { providePanelContext, useInfo } from '../context'
import PanelBody from '../PanelBody'
import PanelHeader from '../PanelHeader'

export default defineComponent({
  name: 'YearPanel',
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
    minDate: Object as PropType<any>,
    maxDate: Object as PropType<any>,
    cellRender: Function as PropType<any>,
    hoverRangeValue: Array as PropType<any>,
    hoverValue: Array as PropType<any>,
    values: Array as PropType<any>,
    showTime: { type: [Boolean, Object] as PropType<any>, default: undefined },
    prevIcon: Object as PropType<any>,
    nextIcon: Object as PropType<any>,
    superPrevIcon: Object as PropType<any>,
    superNextIcon: Object as PropType<any>,
  },
  setup(props) {
    const panelContext = computed(() => {
      const [info] = useInfo(props, 'year')
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
      const panelPrefixCls = `${prefixCls}-year-panel`

      const getStartYear = (date: any) => {
        const startYear = Math.floor(generateConfig.getYear(date) / 10) * 10
        return generateConfig.setYear(date, startYear)
      }
      const getEndYear = (date: any) => {
        const startYear = getStartYear(date)
        return generateConfig.addYear(startYear, 9)
      }

      const startYearDate = getStartYear(pickerValue)
      const endYearDate = getEndYear(pickerValue)

      const baseDate = generateConfig.addYear(startYearDate, -1)

      const getCellDate = (date: any, offset: number) => {
        return generateConfig.addYear(date, offset)
      }

      const getCellText = (date: any) => {
        return formatValue(date, {
          locale,
          format: locale.cellYearFormat,
          generateConfig,
        })
      }

      const getCellClassName = (date: any) => {
        return {
          [`${prefixCls}-cell-in-view`]:
            isSameYear(generateConfig, date, startYearDate)
            || isSameYear(generateConfig, date, endYearDate)
            || isInRange(generateConfig, startYearDate, endYearDate, date),
        }
      }

      const mergedDisabledDate: DisabledDate<any> | undefined = disabledDate
        ? (currentDate, disabledInfo) => {
            const startMonth = generateConfig.setMonth(currentDate, 0)
            const startDate = generateConfig.setDate(startMonth, 1)
            const endMonth = generateConfig.addYear(startDate, 1)
            const endDate = generateConfig.addDate(endMonth, -1)
            return disabledDate(startDate, disabledInfo) && disabledDate(endDate, disabledInfo)
          }
        : undefined

      const yearNode = (
        <button
          type="button"
          key="decade"
          aria-label={locale.decadeSelect}
          onClick={() => {
            onModeChange('decade')
          }}
          tabindex={-1}
          class={`${prefixCls}-decade-btn`}
        >
          {formatValue(startYearDate, {
            locale,
            format: locale.yearFormat,
            generateConfig,
          })}
          -
          {formatValue(endYearDate, {
            locale,
            format: locale.yearFormat,
            generateConfig,
          })}
        </button>
      )

      return (
        <div class={panelPrefixCls}>
          <PanelHeader
            superOffset={(distance: number, date: any) =>
              generateConfig.addYear(date, distance * 10)}
            onChange={onPickerValueChange}
            getStart={getStartYear}
            getEnd={getEndYear}
          >
            {yearNode}
          </PanelHeader>

          <PanelBody
            {...props}
            disabledDate={mergedDisabledDate}
            titleFormat={locale.fieldYearFormat}
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
