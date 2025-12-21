import type { VueNode } from '@v-c/util/dist/type'
import type {
  CSSProperties,
  PropType,
} from 'vue'

export interface PaginationLocale {
  // Options
  items_per_page?: string
  jump_to?: string
  jump_to_confirm?: string
  page?: string

  // Pagination
  prev_page?: string
  next_page?: string
  prev_5?: string
  next_5?: string
  prev_3?: string
  next_3?: string
  page_size?: string
}

type SemanticName = 'item'
export interface PaginationData {
  styles?: Partial<Record<SemanticName, CSSProperties>>
  classNames?: Partial<Record<SemanticName, string>>
  className: string
  selectPrefixCls: string
  prefixCls: string
  pageSizeOptions: number[]

  current: number
  defaultCurrent: number
  total: number
  totalBoundaryShowSizeChanger?: number
  pageSize: number
  defaultPageSize: number

  hideOnSinglePage: boolean
  align: 'start' | 'center' | 'end'
  showSizeChanger: boolean
  sizeChangerRender?: SizeChangerRender
  showLessItems: boolean
  showPrevNextJumpers: boolean
  showQuickJumper: boolean | object
  showTitle: boolean
  simple: boolean | { readOnly?: boolean }
  disabled: boolean

  locale: PaginationLocale

  prevIcon: VueNode
  nextIcon: VueNode
  jumpPrevIcon: VueNode
  jumpNextIcon: VueNode
}

export interface PaginationProps
  extends Partial<PaginationData> {
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
  itemRender?: (
    page: number,
    type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
    element: VueNode,
  ) => VueNode
  showTotal?: (total: number, range: [number, number]) => VueNode
  // WAI-ARIA
  role?: string | undefined
}
export type SizeChangerRender = (info: {
  'disabled': boolean
  'size': number
  'onSizeChange': (value: string | number) => void
  'aria-label': string
  'className': string
  'options': {
    label: string
    value: string | number
  }[]
}) => VueNode

export function optionsProps() {
  return {
    disabled: {
      type: Boolean,
    },
    locale: {
      type: Object as PropType<PaginationLocale>,
      required: true,
    },
    rootPrefixCls: {
      type: String,
      required: true,
    },
    selectPrefixCls: {
      type: String,
    },
    pageSize: {
      type: Number,
      required: true,
    },
    pageSizeOptions: {
      type: Array as PropType<Array<number>>,
    },
    goButton: {
      type: [Boolean, String],
    },
    changeSize: {
      type: Function as PropType<(size: number) => void>,
    },
    quickGo: {
      type: Function as PropType<(value: number | undefined) => void>,
    },
    buildOptionText: {
      type: Function as PropType<(value: string | number) => string>,
    },
    showSizeChanger: {
      type: Boolean,
      require: true,
    },
    sizeChangerRender: {
      type: Function as PropType<SizeChangerRender>,
    },
  }
}
