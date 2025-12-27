import type { Ref } from 'vue'
import { isVNode } from 'vue'
import useMemo from '@v-c/util/dist/hooks/useMemo'
import isEqual from '@v-c/util/dist/isEqual'
import getValue from '@v-c/util/dist/utils/get'
import { warning } from '@v-c/util'
import type { CellType, ColumnType, DataIndex, RenderedCell } from '../interface'
import { validateValue } from '../utils/valueUtil'
import { useInjectPerfContext } from '../context/PerfContext'
import { useImmutableMark } from '../context/TableContext'

function isRenderCell<RecordType>(
  data: any,
): data is RenderedCell<RecordType> {
  return data && typeof data === 'object' && !Array.isArray(data) && !isVNode(data)
}

export default function useCellRender<RecordType>(
  record: RecordType,
  dataIndex: DataIndex<RecordType>,
  renderIndex: number,
  children?: any,
  render?: ColumnType<RecordType>['render'],
  shouldCellUpdate?: ColumnType<RecordType>['shouldCellUpdate'],
) {
  const perfRecord = useInjectPerfContext()
  const mark: Ref<number> = useImmutableMark()

  return useMemo<[any, CellType<RecordType>?] | [any]>(
    () => {
      if (validateValue(children)) {
        return [children]
      }

      const path =
        dataIndex === null || dataIndex === undefined || dataIndex === ''
          ? []
          : Array.isArray(dataIndex)
            ? dataIndex
            : [dataIndex]

      const value: any = getValue(record as any, path as any)

      let returnChildNode = value
      let returnCellProps: CellType<RecordType> | undefined

      if (render) {
        const renderData = render(value, record, renderIndex)
        if (isRenderCell(renderData)) {
          if (process.env.NODE_ENV !== 'production') {
            warning(
              false,
              '`columns.render` return cell props is deprecated with perf issue, please use `onCell` instead.',
            )
          }
          returnChildNode = renderData.props?.children ?? renderData.children
          returnCellProps = renderData.props
          perfRecord.renderWithProps = true
        } else {
          returnChildNode = renderData
        }
      }

      return [returnChildNode, returnCellProps]
    },
    [
      mark,
      record as any,
      children as any,
      dataIndex as any,
      render as any,
      renderIndex as any,
    ],
    (prev, next) => {
      if (shouldCellUpdate) {
        const [, prevRecord] = prev
        const [, nextRecord] = next
        return shouldCellUpdate(nextRecord as any, prevRecord as any)
      }

      if (perfRecord.renderWithProps) {
        return true
      }

      return !isEqual(prev, next, true)
    },
  )
}
