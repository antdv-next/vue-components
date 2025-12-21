import Pagination from '@v-c/pagination'
import { defineComponent } from 'vue'
import '../assets/index.less'

export default defineComponent(() => {
  return () => (
    <>
      <Pagination total={25} />
      <Pagination total={50} />
      <Pagination total={60} />
      <Pagination total={70} />
      <Pagination total={80} />
      <Pagination total={90} />
      <Pagination total={100} />
      <Pagination total={120} />
      <Pagination total={500} />
    </>
  )
})
