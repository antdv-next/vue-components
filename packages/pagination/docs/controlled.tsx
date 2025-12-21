import Pagination from '@v-c/pagination'
import { defineComponent, ref } from 'vue'
import '../assets/index.less'

export default defineComponent(() => {
  const current = ref(1)

  const handleChange = (page: number) => {
    current.value = page
  }

  return () => (
    <Pagination total={25} current={current.value} onChange={handleChange} />
  )
})
