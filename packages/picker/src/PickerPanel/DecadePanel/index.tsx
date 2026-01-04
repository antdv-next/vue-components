import type { GenerateConfig } from '../../generate'
import type { DisabledDate, SharedPanelProps } from '../../interface'
import { computed, defineComponent } from 'vue'
import { formatValue, isInRange, isSameDecade } from '../../utils/dateUtil'
import { providePanelContext, useInfo, useSharedPanelContext } from '../context'
import PanelBody from '../PanelBody'
import PanelHeader from '../PanelHeader'

const DecadePanel = defineComponent<SharedPanelProps>(
  (props: SharedPanelProps) => {
    const sharedContext = useSharedPanelContext()
    const panelContext = computed(() => {
      const [info] = useInfo(props as any, 'decade', sharedContext)
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
      } = props
      const panelPrefixCls = `${prefixCls}-decade-panel`
      const cellYearFormat = locale?.cellYearFormat || 'YYYY'
      const yearFormat = locale?.yearFormat || 'YYYY'

      const getStartYear = (date: any) => {
        const startYear = Math.floor(generateConfig!.getYear(date) / 100) * 100
        return generateConfig!.setYear(date, startYear)
      }
      const getEndYear = (date: any) => {
        const startYear = getStartYear(date)
        return generateConfig.addYear(startYear, 99)
      }

      const startYearDate = getStartYear(pickerValue)
      const endYearDate = getEndYear(pickerValue)

      const baseDate = generateConfig.addYear(startYearDate, -10)

      const getCellDate = (date: any, offset: number) => {
        return generateConfig.addYear(date, offset * 10)
      }

      const getCellText = (date: any) => {
        const startYearStr = formatValue(date, {
          locale,
          format: cellYearFormat,
          generateConfig,
        })
        const endYearStr = formatValue(generateConfig.addYear(date, 9), {
          locale,
          format: cellYearFormat,
          generateConfig,
        })
        return `${startYearStr}-${endYearStr}`
      }

      const getCellClassName = (date: any) => {
        return {
          [`${prefixCls}-cell-in-view`]:
            isSameDecade(generateConfig, date, startYearDate)
            || isSameDecade(generateConfig, date, endYearDate)
            || isInRange(generateConfig, startYearDate, endYearDate, date),
        }
      }

      const mergedDisabledDate: DisabledDate<any> | undefined = disabledDate
        ? (currentDate, disabledInfo) => {
            const baseStartDate = generateConfig.setDate(currentDate, 1)
            const baseStartMonth = generateConfig.setMonth(baseStartDate, 0)
            const baseStartYear = generateConfig.setYear(
              baseStartMonth,
              Math.floor(generateConfig.getYear(baseStartMonth) / 10) * 10,
            )
            const baseEndYear = generateConfig.addYear(baseStartYear, 10)
            const baseEndDate = generateConfig.addDate(baseEndYear, -1)
            return disabledDate(baseStartYear, disabledInfo) && disabledDate(baseEndDate, disabledInfo)
          }
        : undefined

      const yearNode = `${formatValue(startYearDate, {
        locale,
        format: yearFormat,
        generateConfig,
      })}-${formatValue(endYearDate, {
        locale,
        format: yearFormat,
        generateConfig,
      })}`

      return (
        <div class={panelPrefixCls}>
          <PanelHeader
            superOffset={(distance: number, date: any) =>
              generateConfig.addYear(date, distance * 100)}
            onChange={onPickerValueChange}
            getStart={getStartYear}
            getEnd={getEndYear}
          >
            {yearNode}
          </PanelHeader>

          <PanelBody
            {...props}
            disabledDate={mergedDisabledDate}
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
    name: 'DecadePanel',
    inheritAttrs: false,
  },
)

export default DecadePanel
