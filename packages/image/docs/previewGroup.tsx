import { defineComponent } from 'vue'
import Image from '../src'
// @ts-expect-error this is image
import jpg1 from './assets/1.jpeg'
// @ts-expect-error this is image
import jpg2 from './assets/2.jpeg'
// @ts-expect-error this is image
import jpg3 from './assets/3.jpeg'
import { defaultIcons } from './assets/common'
// @ts-expect-error this is image
import disabled from './assets/disabled.jpeg'

export default defineComponent(() => {
  return () => (
    <div>
      <Image.PreviewGroup
        icons={defaultIcons}
        preview={{
          countRender: (current, total) => `第${current}张 / 总共${total}张`,
          onChange: (current, prev) =>
            console.log(`当前第${current}张，上一次第${prev === undefined ? '-' : prev}张`),
        }}
      >
        <Image styles={{ root: { marginRight: '24px', width: '200px' } }} src={jpg1} />
        <Image styles={{ root: { marginRight: '24px', width: '200px' } }} preview={false} src={disabled} />
        <Image styles={{ root: { marginRight: '24px', width: '200px' } }} src={jpg2} />
        <Image styles={{ root: { marginRight: '24px', width: '200px' } }} src={jpg3} />
        <Image styles={{ root: { marginRight: '24px', width: '200px' } }} src="error" alt="error" />
        <Image styles={{ root: { marginRight: '24px', width: '200px' } }} src={jpg1} />
      </Image.PreviewGroup>
    </div>
  )
})
