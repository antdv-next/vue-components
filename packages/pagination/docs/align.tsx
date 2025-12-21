import Pagination from '@v-c/pagination'
import { defineComponent } from 'vue'
import '../assets/index.less'

export default defineComponent(() => {
  return () => (
    <>
      <Pagination align="start" />
      <Pagination align="center" />
      <Pagination align="end" />
    </>
  )
})
