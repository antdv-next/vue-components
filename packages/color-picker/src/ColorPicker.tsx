import type { CSSProperties, VNode } from 'vue'
import type { Components } from './hooks/useComponent'
import type { BaseColorPickerProps, ColorGenInput } from './interface'

import classNames from 'classnames'
import { computed, defineComponent, watch } from 'vue'
import { Color } from './color'
import ColorBlock from './components/ColorBlock'

import Picker from './components/Picker'
import Slider from './components/Slider'
import useColorState from './hooks/useColorState'
import { ColorPickerPrefixCls, defaultColor } from './util'

const HUE_COLORS = [
  {
    color: 'rgb(255, 0, 0)',
    percent: 0,
  },
  {
    color: 'rgb(255, 255, 0)',
    percent: 17,
  },
  {
    color: 'rgb(0, 255, 0)',
    percent: 33,
  },
  {
    color: 'rgb(0, 255, 255)',
    percent: 50,
  },
  {
    color: 'rgb(0, 0, 255)',
    percent: 67,
  },
  {
    color: 'rgb(255, 0, 255)',
    percent: 83,
  },
  {
    color: 'rgb(255, 0, 0)',
    percent: 100,
  },
]

export interface ColorPickerProps extends Omit<BaseColorPickerProps, 'color'> {
  value?: ColorGenInput
  defaultValue?: ColorGenInput
  class?: string
  style?: CSSProperties
  /** Get panel element  */
  panelRender?: (panel: VNode) => VNode
  /** Disabled alpha selection */
  disabledAlpha?: boolean
  components?: Components
}

const ColorPicker = defineComponent({
  props: [
    'value',
    'defaultValue',
    'prefixCls',
    'onChange',
    'onChangeComplete',
    'panelRender',
    'disabledAlpha',
    'disabled',
    'components',
  ],
  emits: ['change', 'changeComplete', 'update:value'],
  setup(props, { attrs, emit }) {
    // ========================== Components ==========================
    // const [Slider] = useComponent(props.components)

    // ============================ Color =============================
    const [colorValue, setColorValue] = useColorState(
      props.defaultValue || defaultColor,
      props.value,
    )

    watch(() => props.value, (newColor) => {
      console.log('newColor', newColor, new Color(newColor))
      setColorValue(new Color(newColor))
    })
    const alphaColor = computed(() => colorValue.value.setA(1).toRgbString())

    // ============================ Events ============================
    const handleChange: BaseColorPickerProps['onChange'] = (data, type) => {
      if (!props.value) {
        setColorValue(data)
      }
      emit('change', data, type)
      emit('update:value', data)
    }

    // Convert
    const getHueColor = (hue: number) => new Color(colorValue.value.setHue(hue))

    const getAlphaColor = (alpha: number) => new Color(colorValue.value.setA(alpha / 100))

    // Slider change
    const onHueChange = (hue: number) => {
      handleChange(getHueColor(hue), { type: 'hue', value: hue })
    }

    const onAlphaChange = (alpha: number) => {
      handleChange(getAlphaColor(alpha), { type: 'alpha', value: alpha })
    }

    // Complete
    const onHueChangeComplete = (hue: number) => {
      emit('changeComplete', getHueColor(hue))
    }

    const onAlphaChangeComplete = (alpha: number) => {
      emit('changeComplete', getHueColor(alpha))
    }

    return () => {
      const {
        prefixCls = ColorPickerPrefixCls,
        onChangeComplete,
        panelRender,
        disabledAlpha = false,
        disabled = false,
      } = props
      // ============================ Render ============================
      const mergeCls = classNames(`${prefixCls}-panel`, [attrs.class], {
        [`${prefixCls}-panel-disabled`]: disabled,
      })

      const sharedSliderProps = {
        prefixCls,
        disabled,
        color: colorValue.value,
      }
      const defaultPanel = (
        <>
          <Picker
            onChange={handleChange}
            {...sharedSliderProps}
            onChangeComplete={onChangeComplete}
          />
          <div class={`${prefixCls}-slider-container`}>
            <div
              class={classNames(`${prefixCls}-slider-group`, {
                [`${prefixCls}-slider-group-disabled-alpha`]: disabledAlpha,
              })}
            >
              <Slider
                {...sharedSliderProps}
                type="hue"
                colors={HUE_COLORS}
                min={0}
                max={359}
                value={colorValue.value.getHue()}
                onChange={onHueChange}
                onChangeComplete={onHueChangeComplete}
              />
              {!disabledAlpha && (
                <Slider
                  {...sharedSliderProps}
                  type="alpha"
                  colors={[
                    { percent: 0, color: 'rgba(255, 0, 4, 0)' },
                    { percent: 100, color: alphaColor.value },
                  ]}
                  min={0}
                  max={100}
                  value={colorValue.value.a * 100}
                  onChange={onAlphaChange}
                  onChangeComplete={onAlphaChangeComplete}
                />
              )}
            </div>
            <ColorBlock color={colorValue.value.toRgbString()} prefixCls={prefixCls} />
          </div>
        </>
      )
      return (
        <div class={mergeCls} style={{ ...attrs.style as CSSProperties }}>
          {typeof panelRender === 'function'
            ? props.panelRender(defaultPanel)
            : defaultPanel}
        </div>
      )
    }
  },
})

export default ColorPicker
