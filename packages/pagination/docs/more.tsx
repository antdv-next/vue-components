import Pagination from '@v-c/pagination'
import { defineComponent } from 'vue'
import '../assets/index.less'

export default defineComponent(() => {
  return () => (
    <Pagination className="ant-pagination" defaultCurrent={3} total={450} />
  )
})
