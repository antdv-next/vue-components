import { defineComponent, ref } from 'vue'
import Image from '../src'
// @ts-expect-error this is image
import jpg1 from './assets/1.jpeg'
// @ts-expect-error this is image
import jpg2 from './assets/2.jpeg'
import { defaultIcons } from './assets/common'

export default defineComponent(() => {
  const open = ref(false)
  const current = ref(1)

  return () => (
    <div>
      <div>
        <button
          type="button"
          onClick={() => {
            open.value = true
          }}
        >
          Switch Preview
        </button>
      </div>
      <Image.PreviewGroup
        preview={{
          icons: defaultIcons,
          open: open.value,
          onOpenChange: (value) => {
            open.value = value
          },
          current: current.value,
          onChange: (c) => {
            current.value = c
          },
        }}
      >
        <Image
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          width={200}
        />
        <Image styles={{ root: { marginRight: '24px', width: '200px' } }} src={jpg1} />
        <Image styles={{ root: { marginRight: '24px', width: '200px' } }} src={jpg2} />
      </Image.PreviewGroup>
    </div>
  )
})
