import type { VueNode } from '@v-c/util/dist/type'
import type { PropType } from 'vue'
import Overflow from '@v-c/overflow'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'

export interface MultipleDatesProps<DateType extends object = any> {
  prefixCls: string
  value: DateType[]
  onRemove: (value: DateType) => void
  removeIcon?: VueNode
  formatDate: (date: DateType) => string
  disabled?: boolean
  placeholder?: VueNode
  maxTagCount?: number | 'responsive'
}

export default defineComponent({
  name: 'MultipleDates',
  props: {
    prefixCls: { type: String, required: true },
    value: { type: Array as PropType<any[]>, required: true },
    onRemove: { type: Function as PropType<(value: any) => void>, required: true },
    removeIcon: { type: [Object, String] as PropType<VueNode> },
    formatDate: { type: Function as PropType<(date: any) => string>, required: true },
    disabled: { type: Boolean, default: false },
    placeholder: { type: [Object, String] as PropType<VueNode> },
    maxTagCount: { type: [Number, String] as PropType<number | 'responsive'> },
  },
  setup(props) {
    return () => {
      const {
        prefixCls,
        value,
        onRemove,
        removeIcon = '×',
        formatDate,
        disabled,
        maxTagCount,
        placeholder,
      } = props

      const selectorCls = `${prefixCls}-selector`
      const selectionCls = `${prefixCls}-selection`
      const overflowCls = `${selectionCls}-overflow`

      // ========================= Item =========================
      function renderSelector(content: VueNode, onClose?: (e: MouseEvent) => void) {
        return (
          <span
            class={clsx(`${selectionCls}-item`)}
            title={typeof content === 'string' ? content : undefined}
          >
            <span class={`${selectionCls}-item-content`}>{content}</span>
            {!disabled && onClose && (
              <span
                onMousedown={(e) => {
                  e.preventDefault()
                }}
                onClick={onClose}
                class={`${selectionCls}-item-remove`}
              >
                {removeIcon}
              </span>
            )}
          </span>
        )
      }

      function renderItem(date: any) {
        const displayLabel = formatDate(date)

        const onClose = (event?: MouseEvent) => {
          if (event)
            event.stopPropagation()
          onRemove(date)
        }

        return renderSelector(displayLabel, onClose)
      }

      // ========================= Rest =========================
      function renderRest(omittedValues: any[]) {
        const content = `+ ${omittedValues.length} ...`

        return renderSelector(content)
      }

      // ======================== Render ========================

      return (
        <div class={selectorCls}>
          <Overflow
            prefixCls={overflowCls}
            data={value}
            renderItem={renderItem}
            renderRest={renderRest}
            // suffix={inputNode}
            itemKey={(date: any) => formatDate(date)}
            maxCount={maxTagCount}
          />
          {!value.length && <span class={`${prefixCls}-selection-placeholder`}>{placeholder}</span>}
        </div>
      )
    }
  },
})
