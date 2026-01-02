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
  rawProps: PresetPanelProps<DateType>,
  { attrs }: { attrs: Record<string, any> },
) => {
  const props = new Proxy(rawProps as Record<string, any>, {
    get(target, key) {
      if (key in target) {
        return target[key as keyof typeof target]
      }
      return (attrs as Record<string, any>)[key as string]
    },
  }) as PresetPanelProps<DateType>

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
})

PresetPanel.name = 'PresetPanel'
PresetPanel.inheritAttrs = false

export default PresetPanel
