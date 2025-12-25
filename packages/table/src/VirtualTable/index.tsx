import { clsx } from '@v-c/util'
import warning from '@v-c/util/dist/warning'
import { computed, defineComponent, reactive, ref, toRef } from 'vue'
import type { CustomizeScrollBody, GetComponent, Reference } from '../interface'
import type { TableProps } from '../Table'
import Table from '../Table'
import { INTERNAL_HOOKS } from '../constant'
import { getPathValue } from '../utils/valueUtil'
import BodyGrid from './BodyGrid'
import { useProvideStatic } from './context'

const DEFAULT_PREFIX = 'vc-table'

const renderBody: CustomizeScrollBody<any> = (rawData, props) => {
  const { ref: bodyRef, onScroll } = props
  return <BodyGrid ref={bodyRef as any} data={rawData as any} onScroll={onScroll} />
}

export interface VirtualTableProps<RecordType> extends Omit<TableProps<RecordType>, 'scroll'> {
  listItemHeight?: number
  scroll: { x?: number; y?: number }
}

const VirtualTable = defineComponent<VirtualTableProps<any>>(
  (props, { expose }) => {
    const tableRef = ref<Reference>()
    const TableComponent = Table as any

    const mergedPrefixCls = computed(() => props.prefixCls ?? DEFAULT_PREFIX)

    const mergedScrollX = computed(() => {
      const scrollX = props.scroll?.x
      if (typeof scrollX !== 'number') {
        if (process.env.NODE_ENV !== 'production') {
          warning(!scrollX, '`scroll.x` in virtual table must be number.')
        }
        return 1
      }
      return scrollX
    })

    const mergedScrollY = computed(() => {
      const scrollY = props.scroll?.y
      if (typeof scrollY !== 'number') {
        if (process.env.NODE_ENV !== 'production') {
          warning(false, '`scroll.y` in virtual table must be number.')
        }
        return 500
      }
      return scrollY
    })

    const getComponent: GetComponent = (path, defaultComponent) =>
      getPathValue(props.components || {}, path) || defaultComponent

    useProvideStatic(
      reactive({
        scrollY: mergedScrollY,
        listItemHeight: computed(() => props.listItemHeight ?? 0),
        sticky: toRef(props, 'sticky'),
        getComponent,
        onScroll: toRef(props, 'onScroll') as any,
      }),
    )

    expose({
      get nativeElement() {
        return tableRef.value?.nativeElement as HTMLDivElement
      },
      scrollTo: config => tableRef.value?.scrollTo(config),
    } as Reference)

    return () => {
      const mergedComponents = {
        ...(props.components || {}),
        ...(props.data?.length ? { body: renderBody } : { body: undefined }),
      }

      return (
        <TableComponent
          {...(props as any)}
          className={clsx(props.className, `${mergedPrefixCls.value}-virtual`)}
          scroll={{ ...(props.scroll || {}), x: mergedScrollX.value, y: mergedScrollY.value }}
          components={mergedComponents}
          internalHooks={INTERNAL_HOOKS}
          tailor
          ref={tableRef as any}
        />
      )
    }
  },
  { name: 'VirtualTable', inheritAttrs: false },
)

export default VirtualTable
