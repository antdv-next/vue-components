import type { ValueDate } from '../../interface'
import { defineComponent } from 'vue'

export interface PresetPanelProps<ValueType extends object = any> {
  prefixCls: string | undefined
  presets: ValueDate<ValueType>[]
  onClick: (value: ValueType) => void
  onHover: (value: ValueType | null) => void
}

function executeValue<ValueType extends object>(value: ValueDate<ValueType>['value']): ValueType {
  return typeof value === 'function' ? value() : value
}

const PresetPanel = defineComponent(<ValueType extends object = any>(
  props: PresetPanelProps<ValueType>,
) => {
  return () => {
    const { prefixCls, presets, onClick, onHover } = props

    if (!presets.length) {
      return null
    }
    return (
      <div class={`${prefixCls}-presets`}>
        <ul>
          {presets.map(({ label, value }, index) => (
            <li
              key={index}
              onClick={() => {
                onClick(executeValue<ValueType>(value))
              }}
              onMouseenter={() => {
                onHover(executeValue<ValueType>(value))
              }}
              onMouseleave={() => {
                onHover(null)
              }}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    )
  }
}, {
  name: 'PresetPanel',
  inheritAttrs: false,
})

export default PresetPanel
