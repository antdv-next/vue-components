import type { PropType } from 'vue'
import { defineComponent, onMounted, ref } from 'vue'
import { calcTotal, generateData } from './dataUtil'

export default defineComponent({
  name: 'BigDataGenerator',
  props: {
    onGen: { type: Function as PropType<(data: any[]) => void>, default: () => {} },
    x: { type: Number, default: 20 },
    y: { type: Number, default: 18 },
    z: { type: Number, default: 1 },
  },
  setup(props) {
    const nums = ref<number>()

    const x = ref(props.x)
    const y = ref(props.y)
    const z = ref(props.z)

    const doGen = () => {
      props.onGen(generateData(x.value, y.value, z.value))
      nums.value = calcTotal(x.value, y.value, z.value)
    }

    const onGen = (e: Event) => {
      e.preventDefault()
      doGen()
    }

    onMounted(() => {
      doGen()
    })

    return () => (
      <div style={{ padding: '0 20px' }}>
        <h2>big data generator</h2>
        <form onSubmit={onGen}>
          <span style={{ marginRight: '10px' }}>
            x:{' '}
            <input
              type="number"
              min="1"
              required
              style={{ width: '50px' }}
              value={x.value}
              onInput={(e: Event) => {
                x.value = Number.parseInt((e.target as HTMLInputElement).value, 10)
              }}
            />
          </span>
          <span style={{ marginRight: '10px' }}>
            y:{' '}
            <input
              type="number"
              min="1"
              required
              style={{ width: '50px' }}
              value={y.value}
              onInput={(e: Event) => {
                y.value = Number.parseInt((e.target as HTMLInputElement).value, 10)
              }}
            />
          </span>
          <span style={{ marginRight: '10px' }}>
            z:{' '}
            <input
              type="number"
              min="1"
              required
              style={{ width: '50px' }}
              value={z.value}
              onInput={(e: Event) => {
                z.value = Number.parseInt((e.target as HTMLInputElement).value, 10)
              }}
            />
          </span>
          <button type="submit">Generate</button>
          <p>
            total nodes: {nums.value ?? calcTotal(x.value, y.value, z.value)}
          </p>
        </form>
        <p style={{ fontSize: '12px' }}>
          x：每一级下的节点总数。y：每级节点里有y个节点、存在子节点。z：树的level层级数（0表示一级）
        </p>
      </div>
    )
  },
})

