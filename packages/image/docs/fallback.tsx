import { defineComponent } from 'vue'
import Image from '../src'
import { defaultIcons } from './assets/common'

export default defineComponent(() => {
  return () => (
    <Image
      preview={{ cover: 'preview!', icons: defaultIcons }}
      src="error1"
      fallback="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
      width={200}
    />
  )
})
