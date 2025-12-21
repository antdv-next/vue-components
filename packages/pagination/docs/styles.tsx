import Pagination from '@v-c/pagination'
import { defineComponent } from 'vue'
import '../assets/index.less'

export default defineComponent(() => {
  return () => (
    <Pagination defaultCurrent={2} total={25} style={{ margin: '100px' }} />
  )
})
