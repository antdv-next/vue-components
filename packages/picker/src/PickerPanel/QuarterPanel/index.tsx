import type { SharedPanelProps } from '../../interface'
import { computed, defineComponent } from 'vue'
import { formatValue } from '../../utils/dateUtil'
import { providePanelContext, useInfo } from '../context'
import PanelBody from '../PanelBody'
import PanelHeader from '../PanelHeader'

const QuarterPanel = defineComponent<SharedPanelProps<any>>(
  <DateType extends object = any>(props: SharedPanelProps<DateType>) => {
    const panelContext = computed(() => {
      const [info] = useInfo(props as any, 'quarter')
      return info
    })

    providePanelContext(panelContext)

    return () => {
      const {
        prefixCls,
        locale,
        generateConfig,
        pickerValue,
        onPickerValueChange,
        onModeChange,
      } = props
      const panelPrefixCls = `${prefixCls}-quarter-panel`

      const baseDate = generateConfig.setMonth(pickerValue, 0)
      const cellQuarterFormat = locale.cellQuarterFormat || '[Q]Q'
      const yearFormat = locale.yearFormat || 'YYYY'

      const getCellDate = (date: any, offset: number) => {
        return generateConfig.addMonth(date, offset * 3)
      }

      const getCellText = (date: any) => {
        return formatValue(date, {
          locale,
          format: cellQuarterFormat,
          generateConfig,
        })
      }

      const getCellClassName = () => ({
        [`${prefixCls}-cell-in-view`]: true,
      })

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
            titleFormat={locale.fieldQuarterFormat}
            colNum={4}
            rowNum={1}
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
    name: 'QuarterPanel',
    inheritAttrs: false,
  },
)

export default QuarterPanel
