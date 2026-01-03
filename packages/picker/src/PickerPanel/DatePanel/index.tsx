import type { PanelMode, SharedPanelProps } from '../../interface'
import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import {
  formatValue,
  getWeekStartDate,
  isSameDate,
  isSameMonth,
  WEEK_DAY_COUNT,
} from '../../utils/dateUtil'
import { providePanelContext, useInfo, useSharedPanelContext } from '../context'
import PanelBody from '../PanelBody'
import PanelHeader from '../PanelHeader'

export interface DatePanelProps<DateType extends object = any> extends SharedPanelProps<DateType> {
  panelName?: PanelMode
  rowClassName?: (date: DateType) => string
  mode?: PanelMode
  cellSelection?: boolean
}

const DatePanel = defineComponent<DatePanelProps>(
  (props) => {
    const sharedContext = useSharedPanelContext()
    const panelContext = computed(() => {
      const panelMode = props.mode || 'date'
      const [info] = useInfo(props as any, panelMode, sharedContext)
      return info
    })
    providePanelContext(panelContext)

    return () => {
      const {
        prefixCls,
        panelName = 'date',
        locale,
        generateConfig,
        pickerValue,
        onPickerValueChange,
        onModeChange,
        mode = 'date',
        disabledDate,
        onSelect,
        onHover,
        showWeek,
      } = props

      const panelPrefixCls = `${prefixCls}-${panelName}-panel`
      const cellPrefixCls = `${prefixCls}-cell`
      const isWeek = mode === 'week'

      const weekFirstDay = generateConfig?.locale?.getWeekFirstDay?.(locale!.locale!) ?? 0
      const monthStartDate = generateConfig?.setDate(pickerValue, 1)
      const baseDate = getWeekStartDate(locale!.locale, generateConfig as any, monthStartDate)
      const month = generateConfig?.getMonth?.(pickerValue)
      const cellDateFormat = locale?.cellDateFormat || locale?.dayFormat || 'D'
      const yearFormat = locale?.yearFormat || 'YYYY'

      // =========================== PrefixColumn ===========================
      const showPrefixColumn = showWeek === undefined ? isWeek : showWeek
      const prefixColumn = showPrefixColumn
        ? (date: any) => {
            const disabled = disabledDate?.(date, { type: 'week' })

            return (
              <td
                key="week"
                class={clsx(cellPrefixCls, `${cellPrefixCls}-week`, {
                  [`${cellPrefixCls}-disabled`]: disabled,
                })}
                onClick={() => {
                  if (!disabled) {
                    onSelect?.(date)
                  }
                }}
                onMouseenter={() => {
                  if (!disabled) {
                    onHover?.(date)
                  }
                }}
                onMouseleave={() => {
                  if (!disabled) {
                    onHover?.(null)
                  }
                }}
              >
                <div class={`${cellPrefixCls}-inner`}>
                  {generateConfig?.locale.getWeek?.(locale!.locale, date)}
                </div>
              </td>
            )
          }
        : undefined

      // ========================= Cells ==========================
      const headerCells: any[] = []
      const weekDaysLocale: string[]
        = locale?.shortWeekDays
          || (generateConfig?.locale?.getShortWeekDays
            ? generateConfig.locale.getShortWeekDays(locale!.locale)
            : [])

      if (prefixColumn) {
        headerCells.push(
          <th key="empty">
            <span style={{ width: 0, height: 0, position: 'absolute', overflow: 'hidden', opacity: 0 }}>
              {locale!.week}
            </span>
          </th>,
        )
      }
      for (let i = 0; i < WEEK_DAY_COUNT; i += 1) {
        headerCells.push(<th key={i}>{weekDaysLocale[(i + weekFirstDay) % WEEK_DAY_COUNT]}</th>)
      }

      const getCellDate = (date: any, offset: number) => {
        return generateConfig?.addDate?.(date, offset)
      }

      const getCellText = (date: any) => {
        return formatValue(date, {
          locale: locale!,
          format: cellDateFormat,
          generateConfig: generateConfig!,
        })
      }

      const getCellClassName = (date: any) => {
        const nowVal = panelContext.value.now

        return {
          [`${prefixCls}-cell-in-view`]: isSameMonth(generateConfig!, date, pickerValue),
          [`${prefixCls}-cell-today`]: isSameDate(generateConfig!, date, nowVal),
        }
      }

      // ========================= Header =========================
      const monthsLocale: string[]
        = locale?.shortMonths
          || (generateConfig?.locale?.getShortMonths
            ? generateConfig.locale.getShortMonths?.(locale!.locale)
            : [])

      const yearNode = (
        <button
          type="button"
          aria-label={locale?.yearSelect}
          key="year"
          onClick={() => {
            onModeChange?.('year', pickerValue)
          }}
          tabindex={-1}
          class={`${prefixCls}-year-btn`}
        >
          {formatValue(pickerValue, {
            locale: locale!,
            format: yearFormat,
            generateConfig: generateConfig!,
          })}
        </button>
      )
      const monthNode = (
        <button
          type="button"
          aria-label={locale?.monthSelect}
          key="month"
          onClick={() => {
            onModeChange?.('month', pickerValue)
          }}
          tabindex={-1}
          class={`${prefixCls}-month-btn`}
        >
          {locale?.monthFormat
            ? formatValue(pickerValue, {
                locale,
                format: locale.monthFormat,
                generateConfig: generateConfig!,
              })
            : monthsLocale[month!]}
        </button>
      )

      const monthYearNodes = locale?.monthBeforeYear ? [monthNode, yearNode] : [yearNode, monthNode]
      return (
        <div class={clsx(panelPrefixCls, showWeek && `${panelPrefixCls}-show-week`)}>
          <PanelHeader
            offset={(distance: number, date: any) => generateConfig?.addMonth?.(date, distance)}
            superOffset={(distance: number, date: any) => generateConfig?.addYear?.(date, distance)}
            onChange={onPickerValueChange}
            getStart={(date: any) => generateConfig?.setDate?.(date, 1)}
            getEnd={(date: any) => {
              let clone = generateConfig?.setDate?.(date, 1)
              clone = generateConfig?.addMonth(clone!, 1)
              return generateConfig?.addDate(clone!, -1)
            }}
          >
            {monthYearNodes}
          </PanelHeader>

          <PanelBody
            {...props}
            titleFormat={locale?.fieldDateFormat}
            colNum={WEEK_DAY_COUNT}
            rowNum={6}
            baseDate={baseDate}
            headerCells={headerCells}
            getCellDate={getCellDate}
            getCellText={getCellText}
            getCellClassName={getCellClassName}
            prefixColumn={prefixColumn}
            cellSelection={!isWeek}
          />
        </div>
      )
    }
  },
  {
    name: 'DatePanel',
    inheritAttrs: false,
  },
)

export default DatePanel
