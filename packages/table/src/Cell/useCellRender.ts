import type { Ref } from 'vue'
import type { CellType, ColumnType, DataIndex, RenderedCell } from '../interface'
import { warning } from '@v-c/util'
import isEqual from '@v-c/util/dist/isEqual'
import getValue from '@v-c/util/dist/utils/get'
import { computed, isVNode, ref, unref } from 'vue'
import { useInjectPerfContext } from '../context/PerfContext'
import { useImmutableMark } from '../context/TableContext'
import { validateValue } from '../utils/valueUtil'

function isRenderCell<RecordType>(
  data: any,
): data is RenderedCell<RecordType> {
  return data && typeof data === 'object' && !Array.isArray(data) && !isVNode(data)
}

export default function useCellRender<RecordType>(
  record: Ref<RecordType> | RecordType,
  dataIndex: Ref<DataIndex<RecordType> | undefined> | DataIndex<RecordType> | undefined,
  renderIndex: Ref<number> | number,
  children?: Ref<any> | any,
  render?: Ref<ColumnType<RecordType>['render'] | undefined> | ColumnType<RecordType>['render'],
  shouldCellUpdate?: Ref<ColumnType<RecordType>['shouldCellUpdate'] | undefined> | ColumnType<RecordType>['shouldCellUpdate'],
) {
  const perfRecord = useInjectPerfContext()
  const mark: Ref<number> = useImmutableMark()

  const cache = ref<[any, CellType<RecordType>?] | [any]>()
  let prevDeps: any[] | null = null

  const getRenderValue = (
    mergedRecord: RecordType,
    mergedDataIndex: DataIndex<RecordType> | undefined,
    mergedRenderIndex: number,
    mergedChildren: any,
    mergedRender?: ColumnType<RecordType>['render'],
  ) => {
    if (validateValue(mergedChildren)) {
      return [mergedChildren]
    }

    const path
      = mergedDataIndex === null || mergedDataIndex === undefined || mergedDataIndex === ''
        ? []
        : Array.isArray(mergedDataIndex)
          ? mergedDataIndex
          : [mergedDataIndex]

    const value: any = getValue(mergedRecord as any, path as any)

    let returnChildNode = value
    let returnCellProps: CellType<RecordType> | undefined

    if (mergedRender) {
      const renderData = mergedRender(value, mergedRecord, mergedRenderIndex)
      if (isRenderCell<RecordType>(renderData)) {
        if (process.env.NODE_ENV !== 'production') {
          warning(
            false,
            '`columns.render` return cell props is deprecated with perf issue, please use `onCell` instead.',
          )
        }
        returnChildNode = renderData.props?.children ?? renderData.children
        returnCellProps = renderData.props
        perfRecord.renderWithProps = true
      }
      else {
        returnChildNode = renderData
      }
    }

    return [returnChildNode, returnCellProps] as [any, CellType<RecordType>?] | [any]
  }

  return computed<[any, CellType<RecordType>?] | [any]>(() => {
    const mergedRecord = unref(record)
    const mergedDataIndex = unref(dataIndex)
    const mergedRenderIndex = unref(renderIndex)
    const mergedChildren = unref(children)
    const mergedRender = unref(render)
    const mergedShouldCellUpdate = unref(shouldCellUpdate)

    const nextDeps = [
      mark.value,
      mergedRecord as any,
      mergedChildren as any,
      mergedDataIndex as any,
      mergedRender as any,
      mergedRenderIndex as any,
    ]

    if (prevDeps) {
      if (mergedShouldCellUpdate) {
        const [, prevRecord] = prevDeps
        const [, nextRecord] = nextDeps
        if (!mergedShouldCellUpdate(nextRecord as any, prevRecord as any)) {
          return cache.value as any
        }
      }
      else if (!perfRecord.renderWithProps && isEqual(prevDeps, nextDeps, true)) {
        return cache.value as any
      }
    }

    const nextValue = getRenderValue(
      mergedRecord,
      mergedDataIndex,
      mergedRenderIndex,
      mergedChildren,
      mergedRender,
    )
    cache.value = nextValue
    prevDeps = nextDeps
    return nextValue
  })
}
