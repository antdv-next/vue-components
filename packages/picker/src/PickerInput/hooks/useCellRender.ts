import type { Ref } from 'vue'
import type { CellRender, CellRenderInfo, SharedPickerProps } from '../../interface'
import { warning } from '@v-c/util'

export default function useCellRender<DateType extends object = any>(
  cellRender: Ref<SharedPickerProps<DateType>['cellRender'] | undefined>,
  dateRender?: Ref<SharedPickerProps<DateType>['dateRender'] | undefined>,
  monthCellRender?: Ref<SharedPickerProps<DateType>['monthCellRender'] | undefined>,
  range?: Ref<CellRenderInfo<DateType>['range'] | undefined>,
) {
  // ========================= Warn =========================
  if (process.env.NODE_ENV !== 'production') {
    warning(!dateRender?.value, `'dateRender' is deprecated. Please use 'cellRender' instead.`)
    warning(
      !monthCellRender?.value,
      `'monthCellRender' is deprecated. Please use 'cellRender' instead.`,
    )
  }

  // ======================== Render ========================
  // Merged render
  const mergedCellRender = (current: string | DateType | number, info: CellRenderInfo<DateType>) => {
    if (cellRender.value) {
      return cellRender.value(current, info)
    }

    const date = current as DateType

    if (dateRender?.value && info.type === 'date') {
      return dateRender.value(date, info.today)
    }
    if (monthCellRender?.value && info.type === 'month') {
      return monthCellRender.value(date, info.locale!)
    }
    return info.originNode
  }

  // Cell render
  const onInternalCellRender: CellRender<DateType> = (date, info) =>
    mergedCellRender(date, { ...info, range: range?.value })

  return onInternalCellRender
}
