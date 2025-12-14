import { defineComponent } from 'vue'
import Image from '../src'
// @ts-expect-error this is image
import jpg1 from './assets/1.jpeg'
// @ts-expect-error this is image
import jpg2 from './assets/2.jpeg'
// @ts-expect-error this is image
import jpg3 from './assets/3.jpeg'
import { defaultIcons } from './assets/common'

export default defineComponent(() => {
  return () => (
    <div>
      <Image.PreviewGroup icons={defaultIcons} items={[jpg1, jpg2, jpg3]}>
        <Image src={jpg1} />
      </Image.PreviewGroup>
    </div>
  )
})
