import type { PropType } from 'vue'
import { defineComponent, onMounted, ref } from 'vue'
import { calcTotal, generateData } from './utils/dataUtil'

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
    const xRef = ref<HTMLInputElement>()
    const yRef = ref<HTMLInputElement>()
    const zRef = ref<HTMLInputElement>()

    const getVals = () => ({
      x: Number.parseInt(xRef.value?.value || `${props.x}`, 10),
      y: Number.parseInt(yRef.value?.value || `${props.y}`, 10),
      z: Number.parseInt(zRef.value?.value || `${props.z}`, 10),
    })

    const onGen = (e: Event) => {
      e.preventDefault()
      const vals = getVals()
      props.onGen(generateData(vals.x, vals.y, vals.z))
      nums.value = calcTotal(vals.x, vals.y, vals.z)
    }

    onMounted(() => {
      const vals = getVals()
      props.onGen(generateData(vals.x, vals.y, vals.z))
    })

    return () => (
      <div style={{ padding: '0 20px' }}>
        <h2>big data generator</h2>
        <form onSubmit={onGen}>
          <label style={{ marginRight: '10px' }}>
            x:
            <input ref={xRef} value={(props as any).x} type="number" min="1" required style={{ width: '60px' }} />
          </label>
          <label style={{ marginRight: '10px' }}>
            y:
            <input ref={yRef} value={props.y} type="number" min="0" required style={{ width: '60px' }} />
          </label>
          <label style={{ marginRight: '10px' }}>
            z:
            <input ref={zRef} value={props.z} type="number" min="0" required style={{ width: '60px' }} />
          </label>
          <button type="submit">Generate</button>
          <p>
            total nodes:
            {nums.value ?? calcTotal(props.x, props.y, props.z)}
          </p>
        </form>
        <p style={{ fontSize: '12px' }}>
          x：每一级下的节点总数。y：每级节点里有y个节点、存在子节点。z：树的level层级数（0表示一级）
        </p>
      </div>
    )
  },
})
