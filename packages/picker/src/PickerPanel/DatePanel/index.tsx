import type { PropType } from 'vue'
import type { PanelMode } from '../../interface'
import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import {
  formatValue,
  getWeekStartDate,
  isSameDate,
  isSameMonth,
  WEEK_DAY_COUNT,
} from '../../utils/dateUtil'
import { providePanelContext, useInfo } from '../context'
import PanelBody from '../PanelBody'
import PanelHeader from '../PanelHeader'

export default defineComponent({
  name: 'DatePanel',
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
    showWeek: { type: Boolean, default: undefined },
    panelName: { type: String, default: 'date' },
    rowClassName: Function as PropType<(date: any) => string>,
    mode: { type: String as PropType<PanelMode>, default: 'date' },
    cellSelection: { type: Boolean, default: true },

    // Other SharedPanelProps
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
      const [info] = useInfo(props as any, props.mode)
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

      const weekFirstDay = generateConfig.locale.getWeekFirstDay(locale.locale)
      const monthStartDate = generateConfig.setDate(pickerValue, 1)
      const baseDate = getWeekStartDate(locale.locale, generateConfig, monthStartDate)
      const month = generateConfig.getMonth(pickerValue)

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
                  {generateConfig.locale.getWeek(locale.locale, date)}
                </div>
              </td>
            )
          }
        : undefined

      // ========================= Cells ==========================
      const headerCells: any[] = []
      const weekDaysLocale: string[]
        = locale.shortWeekDays
          || (generateConfig.locale.getShortWeekDays
            ? generateConfig.locale.getShortWeekDays(locale.locale)
            : [])

      if (prefixColumn) {
        headerCells.push(
          <th key="empty">
            <span style={{ width: 0, height: 0, position: 'absolute', overflow: 'hidden', opacity: 0 }}>
              {locale.week}
            </span>
          </th>,
        )
      }
      for (let i = 0; i < WEEK_DAY_COUNT; i += 1) {
        headerCells.push(<th key={i}>{weekDaysLocale[(i + weekFirstDay) % WEEK_DAY_COUNT]}</th>)
      }

      const getCellDate = (date: any, offset: number) => {
        return generateConfig.addDate(date, offset)
      }

      const getCellText = (date: any) => {
        return formatValue(date, {
          locale,
          format: locale.cellDateFormat,
          generateConfig,
        })
      }

      const getCellClassName = (date: any) => {
        const [_, now] = useInfo(props as any, mode) // Re-calling useInfo here to get 'now'.
        // Note: useInfo logic for 'now' is just generateConfig.getNow().
        // calling useInfo inside render is fine, but maybe inefficient.
        // I can just get 'now' from panelContext.value.now

        const nowVal = panelContext.value.now

        return {
          [`${prefixCls}-cell-in-view`]: isSameMonth(generateConfig, date, pickerValue),
          [`${prefixCls}-cell-today`]: isSameDate(generateConfig, date, nowVal),
        }
      }

      // ========================= Header =========================
      const monthsLocale: string[]
        = locale.shortMonths
          || (generateConfig.locale.getShortMonths
            ? generateConfig.locale.getShortMonths(locale.locale)
            : [])

      const yearNode = (
        <button
          type="button"
          aria-label={locale.yearSelect}
          key="year"
          onClick={() => {
            onModeChange?.('year', pickerValue)
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
      const monthNode = (
        <button
          type="button"
          aria-label={locale.monthSelect}
          key="month"
          onClick={() => {
            onModeChange?.('month', pickerValue)
          }}
          tabindex={-1}
          class={`${prefixCls}-month-btn`}
        >
          {locale.monthFormat
            ? formatValue(pickerValue, {
                locale,
                format: locale.monthFormat,
                generateConfig,
              })
            : monthsLocale[month]}
        </button>
      )

      const monthYearNodes = locale.monthBeforeYear ? [monthNode, yearNode] : [yearNode, monthNode]

      return (
        <div class={clsx(panelPrefixCls, showWeek && `${panelPrefixCls}-show-week`)}>
          <PanelHeader
            offset={(distance: number, date: any) => generateConfig.addMonth(date, distance)}
            superOffset={(distance: number, date: any) => generateConfig.addYear(date, distance)}
            onChange={onPickerValueChange}
            getStart={(date: any) => generateConfig.setDate(date, 1)}
            getEnd={(date: any) => {
              let clone = generateConfig.setDate(date, 1)
              clone = generateConfig.addMonth(clone, 1)
              return generateConfig.addDate(clone, -1)
            }}
          >
            {monthYearNodes}
          </PanelHeader>

          <PanelBody
            {...props}
            titleFormat={locale.fieldDateFormat}
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
})
