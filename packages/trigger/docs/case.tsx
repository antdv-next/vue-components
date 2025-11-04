import { computed, defineComponent, h, ref } from 'vue'
import Trigger from '../src'
import './case.less'

const builtinPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
}

const Motion = {
  name: 'case-motion',
}

const MaskMotion = {
  name: 'mask-motion',
}

const LabelItem = defineComponent<{ title: string }>((props, { slots, attrs }) => {
  return () => (
    <label
      style={{
        display: 'inline-flex',
        padding: '0 8px',
        alignItems: 'center',
      }}
    >
      {props.title}
      <span style={{ width: '4px' }} />
      {slots.default?.()?.map(node => h(node, attrs))}
    </label>
  )
})

export default defineComponent(() => {
  const hover = ref(true)
  const focus = ref(false)
  const click = ref(false)
  const contextMenu = ref(false)

  const placement = ref('right')
  const stretch = ref('')
  const motion = ref(true)
  const destroyPopupOnHide = ref(false)
  const mask = ref(false)
  const maskClosable = ref(true)
  const forceRender = ref(false)
  const offsetX = ref<number>(0)
  const offsetY = ref<number>(0)

  const actionsKeys = computed(() => {
    const actions: Record<string, boolean> = {
      hover: hover.value,
      focus: focus.value,
      click: click.value,
      contextMenu: contextMenu.value,
    }
    return Object.keys(actions).filter(key => actions[key])
  })

  return () => (
    <div>
      <div style={{ margin: '10px 20px' }}>
        <strong>Actions: </strong>
        <LabelItem title="Hover">
          <input
            type="checkbox"
            checked={hover.value}
            onChange={(event) => {
              hover.value = (event.target as HTMLInputElement).checked
            }}
          />
        </LabelItem>
        <LabelItem title="Focus">
          <input
            type="checkbox"
            checked={focus.value}
            onChange={(event) => {
              focus.value = (event.target as HTMLInputElement).checked
            }}
          />
        </LabelItem>
        <LabelItem title="Click">
          <input
            type="checkbox"
            checked={click.value}
            onChange={(event) => {
              click.value = (event.target as HTMLInputElement).checked
            }}
          />
        </LabelItem>
        <LabelItem title="ContextMenu">
          <input
            type="checkbox"
            checked={contextMenu.value}
            onChange={(event) => {
              contextMenu.value = (event.target as HTMLInputElement).checked
            }}
          />
        </LabelItem>

        <hr />

        <LabelItem title="Stretch">
          <select
            value={stretch.value}
            onChange={(event) => {
              stretch.value = (event.target as HTMLSelectElement).value
            }}
          >
            <option value="">--NONE--</option>
            <option value="width">width</option>
            <option value="minWidth">minWidth</option>
            <option value="height">height</option>
            <option value="minHeight">minHeight</option>
          </select>
        </LabelItem>

        <LabelItem title="Placement">
          <select
            value={placement.value}
            onChange={(event) => {
              placement.value = (event.target as HTMLSelectElement).value
            }}
          >
            {['right', 'left', 'top', 'bottom', 'topLeft', 'topRight', 'bottomRight', 'bottomLeft'].map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </LabelItem>

        <LabelItem title="Motion">
          <input
            type="checkbox"
            checked={motion.value}
            onChange={(event) => {
              motion.value = (event.target as HTMLInputElement).checked
            }}
          />
        </LabelItem>

        <LabelItem title="Destroy Popup On Hide">
          <input
            type="checkbox"
            checked={destroyPopupOnHide.value}
            onChange={(event) => {
              destroyPopupOnHide.value = (event.target as HTMLInputElement).checked
            }}
          />
        </LabelItem>

        <LabelItem title="Mask">
          <input
            type="checkbox"
            checked={mask.value}
            onChange={(event) => {
              mask.value = (event.target as HTMLInputElement).checked
            }}
          />
        </LabelItem>

        <LabelItem title="Mask Closable">
          <input
            type="checkbox"
            checked={maskClosable.value}
            onChange={(event) => {
              maskClosable.value = (event.target as HTMLInputElement).checked
            }}
          />
        </LabelItem>

        <LabelItem title="Force Render">
          <input
            type="checkbox"
            checked={forceRender.value}
            onChange={(event) => {
              forceRender.value = (event.target as HTMLInputElement).checked
            }}
          />
        </LabelItem>

        <LabelItem title="OffsetX">
          <input
            value={offsetX.value}
            onChange={(event) => {
              const { value } = event.target as HTMLInputElement
              offsetX.value = value === '' ? 0 : Number(value)
            }}
          />
        </LabelItem>

        <LabelItem title="OffsetY">
          <input
            value={offsetY.value}
            onChange={(event) => {
              const { value } = event.target as HTMLInputElement
              offsetY.value = value === '' ? 0 : Number(value)
            }}
          />
        </LabelItem>
      </div>

      <div style={{ margin: '120px', position: 'relative' }}>
        <Trigger
          popupAlign={{
            offset: [offsetX.value, offsetY.value],
            overflow: {
              adjustX: 1,
              adjustY: 1,
            },
          }}
          popupPlacement={placement.value as any}
          autoDestroy={destroyPopupOnHide.value}
          mask={mask.value}
          maskMotion={motion.value ? MaskMotion : undefined}
          maskClosable={maskClosable.value}
          stretch={stretch.value || undefined}
          action={actionsKeys.value as any}
          builtinPlacements={builtinPlacements}
          forceRender={forceRender.value}
          popupStyle={{
            border: '1px solid red',
            padding: '10px',
            background: 'white',
            boxSizing: 'border-box',
          }}
          popup={() => <div>i am a popup</div>}
          popupMotion={motion.value ? Motion : undefined}
          onPopupAlign={() => {
            console.warn('Aligned!')
          }}
        >
          <div
            style={{
              margin: 20,
              display: 'inline-block',
              background: 'rgba(255, 0, 0, 0.05)',
            }}
            tabIndex={0}
            role="button"
          >
            <p>This is a example of trigger usage.</p>
            <p>You can adjust the value above</p>
            <p>which will also change the behaviour of popup.</p>
          </div>
        </Trigger>
      </div>
    </div>
  )
})
