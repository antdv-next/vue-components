import Pagination from '@v-c/pagination'
/* eslint no-console: 0 */
import { defineComponent, ref } from 'vue'
import '../assets/index.less'

export default defineComponent(() => {
  const current = ref(3)

  const setShowTitleState = (page: number) => {
    console.log(page)
    current.value = page
  }

  return () => (
    <div>
      <Pagination
        current={current.value}
        total={80}
        showLessItems
        showTitle={false}
        onChange={setShowTitleState}
      />
      <Pagination
        showLessItems
        defaultCurrent={1}
        total={60}
        showTitle={false}
      />
    </div>
  )
})
