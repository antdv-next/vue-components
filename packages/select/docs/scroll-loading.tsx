import { defineComponent, ref } from 'vue'
import Select from '../src'
import './assets/index.less'

const ScrollLoadingDemo = defineComponent({
  name: 'ScrollLoadingDemo',
  setup() {
    const value = ref<string>()
    const options = ref<{ value: string, label: string }[]>([])
    const loading = ref(false)
    const page = ref(1)
    const hasMore = ref(true)

    const loadMore = () => {
      if (loading.value || !hasMore.value)
        return

      loading.value = true

      // Simulate API call
      setTimeout(() => {
        const start = (page.value - 1) * 10
        const newOptions = Array.from({ length: 10 }, (_, i) => ({
          value: `option_${start + i}`,
          label: `Option ${start + i + 1}`,
        }))

        options.value = [...options.value, ...newOptions]
        page.value += 1
        loading.value = false

        // Stop loading after 50 items
        if (options.value.length >= 50) {
          hasMore.value = false
        }
      }, 500)
    }

    // Initial load
    loadMore()

    const onPopupScroll = (e: Event) => {
      const target = e.target as HTMLDivElement
      // Load more when scrolled to bottom
      if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
        loadMore()
      }
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Scroll Loading Demo</h2>

        <Select
          value={value.value}
          style={{ width: '300px' }}
          placeholder="Scroll to load more"
          onPopupScroll={onPopupScroll}
          onChange={(val: string) => {
            value.value = val
          }}
          options={options.value}
          popupRender={(menu: any) => (
            <div>
              {menu}
              {loading.value && (
                <div style={{ textAlign: 'center', padding: '8px' }}>Loading...</div>
              )}
              {!hasMore.value && (
                <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
                  No more data
                </div>
              )}
            </div>
          )}
        />
      </div>
    )
  },
})

export default ScrollLoadingDemo
