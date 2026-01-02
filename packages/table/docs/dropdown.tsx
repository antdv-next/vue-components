import { computed, defineComponent, ref } from 'vue'
import Table from '../src'

const data = Array.from({ length: 10 }, (_, i) => ({
  key: i,
  a: `a${i}`,
  b: `b${i}`,
  c: `c${i}`,
}))

export default defineComponent(() => {
  const visible = ref(false)
  const filters = ref<string[]>([])

  const toggleFilter = (key: string) => {
    if (filters.value.includes(key)) {
      filters.value = filters.value.filter(item => item !== key)
    }
    else {
      filters.value = [...filters.value, key]
    }
  }

  const confirmFilter = () => {
    console.log(filters.value.join(','))
    visible.value = false
  }

  const columns = computed(() => [
    {
      title: (
        <div style={{ position: 'relative', display: 'inline-flex', gap: '8px' }}>
          <span>title1</span>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              visible.value = !visible.value
            }}
          >
            filter
          </a>
          {visible.value && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                border: '1px solid #ccc',
                background: '#fff',
                padding: '8px',
                zIndex: 10,
                width: '160px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              {['1', '2', '3'].map(key => (
                <label key={key} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <input
                    type="checkbox"
                    checked={filters.value.includes(key)}
                    onChange={() => toggleFilter(key)}
                  />
                  <span>{key === '1' ? 'one' : key === '2' ? 'two' : 'three'}</span>
                </label>
              ))}
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <button type="button" onClick={confirmFilter}>
                  确定
                </button>
              </div>
            </div>
          )}
        </div>
      ),
      key: 'a',
      dataIndex: 'a',
      width: 100,
    },
    { title: 'title2', key: 'b', dataIndex: 'b', width: 100 },
    { title: 'title3', key: 'c', dataIndex: 'c', width: 200 },
  ])

  return () => <Table columns={columns.value} data={data} rowKey={record => record.key} />
})
