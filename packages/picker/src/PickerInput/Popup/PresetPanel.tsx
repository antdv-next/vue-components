import type { ValueDate } from '../../interface'
import { defineComponent } from 'vue'

export interface PresetPanelProps<DateType extends object = any> {
  prefixCls: string | undefined
  presets: ValueDate<DateType>[]
  onClick: (value: DateType) => void
  onHover: (value: DateType | null) => void
}

function executeValue<DateType extends object>(value: ValueDate<DateType>['value']): DateType {
  return typeof value === 'function' ? value() : value
}

const PresetPanel = defineComponent(<DateType extends object = any>(
  props: PresetPanelProps<DateType>,
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
                onClick(executeValue<DateType>(value))
              }}
              onMouseenter={() => {
                onHover(executeValue<DateType>(value))
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
