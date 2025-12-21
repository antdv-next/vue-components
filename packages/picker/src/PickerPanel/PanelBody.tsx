import { defineComponent } from 'vue';
import type { PropType, VNode } from 'vue';
import classNames from 'classnames';
import { usePanelContext, usePickerHackContext } from './context';
import { formatValue, isInRange, isSame } from '../utils/dateUtil';
import type { DisabledDate } from '../interface';

export default defineComponent({
  name: 'PanelBody',
  props: {
    rowNum: { type: Number, required: true },
    colNum: { type: Number, required: true },
    baseDate: { type: Object as PropType<any>, required: true },
    getCellDate: { type: Function as PropType<(date: any, offset: number) => any>, required: true },
    getCellText: { type: Function as PropType<(date: any) => any>, required: true },
    getCellClassName: { type: Function as PropType<(date: any) => Record<string, any>>, required: true },
    disabledDate: { type: Function as PropType<DisabledDate<any>> },
    titleFormat: { type: String },
    headerCells: { type: Array as PropType<any[]> },
    prefixColumn: { type: Function as PropType<(date: any) => any> },
    rowClassName: { type: Function as PropType<(date: any) => string> },
    cellSelection: { type: Boolean, default: true },
  },
  setup(props) {
    const context = usePanelContext();
    const pickerHackContext = usePickerHackContext();

    return () => {
      const {
        prefixCls,
        classNames: panelClassNames,
        styles,
        panelType,
        now,
        disabledDate: contextDisabledDate,
        cellRender,
        onHover,
        hoverValue,
        hoverRangeValue,
        generateConfig,
        values,
        locale,
        onSelect,
      } = context.value;

      const {
        rowNum,
        colNum,
        baseDate,
        getCellDate,
        prefixColumn,
        rowClassName,
        titleFormat,
        getCellText,
        getCellClassName,
        headerCells,
        cellSelection,
        disabledDate,
      } = props;

      const { onCellDblClick } = pickerHackContext?.value || {};

      const mergedDisabledDate = disabledDate || contextDisabledDate;
      const cellPrefixCls = `${prefixCls}-cell`;

      const matchValues = (date: any) =>
        values.some((singleValue) =>
          singleValue && isSame(generateConfig, locale, date, singleValue, panelType)
        );

      const rows: VNode[] = [];

      for (let row = 0; row < rowNum; row += 1) {
        const rowNode: VNode[] = [];
        let rowStartDate: any;

        for (let col = 0; col < colNum; col += 1) {
          const offset = row * colNum + col;
          const currentDate = getCellDate(baseDate, offset);

          const disabled = mergedDisabledDate?.(currentDate, {
            type: panelType,
          });

          if (col === 0) {
            rowStartDate = currentDate;
            if (prefixColumn) {
              rowNode.push(prefixColumn(rowStartDate));
            }
          }

          let inRange = false;
          let rangeStart = false;
          let rangeEnd = false;

          if (cellSelection && hoverRangeValue) {
            const [hoverStart, hoverEnd] = hoverRangeValue;
            inRange = isInRange(generateConfig, hoverStart, hoverEnd, currentDate);
            rangeStart = isSame(generateConfig, locale, currentDate, hoverStart, panelType);
            rangeEnd = isSame(generateConfig, locale, currentDate, hoverEnd, panelType);
          }

          const title = titleFormat
            ? formatValue(currentDate, {
                locale,
                format: titleFormat,
                generateConfig,
              })
            : undefined;

          const inner = <div class={`${cellPrefixCls}-inner`}>{getCellText(currentDate)}</div>;

          rowNode.push(
            <td
              key={col}
              title={title}
              class={classNames(cellPrefixCls, panelClassNames.item, {
                [`${cellPrefixCls}-disabled`]: disabled,
                [`${cellPrefixCls}-hover`]: (hoverValue || []).some((date) =>
                  isSame(generateConfig, locale, currentDate, date, panelType),
                ),
                [`${cellPrefixCls}-in-range`]: inRange && !rangeStart && !rangeEnd,
                [`${cellPrefixCls}-range-start`]: rangeStart,
                [`${cellPrefixCls}-range-end`]: rangeEnd,
                [`${prefixCls}-cell-selected`]:
                  !hoverRangeValue &&
                  // WeekPicker use row instead
                  panelType !== 'week' &&
                  matchValues(currentDate),
                ...getCellClassName(currentDate),
              })}
              style={styles.item}
              onClick={() => {
                if (!disabled) {
                  onSelect(currentDate);
                }
              }}
              onDblclick={() => {
                if (!disabled && onCellDblClick) {
                  onCellDblClick();
                }
              }}
              onMouseenter={() => {
                if (!disabled) {
                  onHover?.(currentDate);
                }
              }}
              onMouseleave={() => {
                if (!disabled) {
                  onHover?.(null);
                }
              }}
            >
              {cellRender
                ? cellRender(currentDate, {
                    prefixCls,
                    originNode: inner,
                    today: now,
                    type: panelType,
                    locale,
                  })
                : inner}
            </td>,
          );
        }

        rows.push(
          <tr key={row} class={rowClassName?.(rowStartDate!)}>
            {rowNode}
          </tr>,
        );
      }

      return (
        <div class={classNames(`${prefixCls}-body`, panelClassNames.body)} style={styles.body}>
          <table
            class={classNames(`${prefixCls}-content`, panelClassNames.content)}
            style={styles.content}
          >
            {headerCells && (
              <thead>
                <tr>{headerCells}</tr>
              </thead>
            )}
            <tbody>{rows}</tbody>
          </table>
        </div>
      );
    },
  },
});
