import { defineComponent, ref } from 'vue'
import Image from '../src'
import { defaultIcons } from './assets/common'

export default defineComponent(() => {
  const open = ref(false)

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
      <Image
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        width={200}
        preview={{
          icons: defaultIcons,
          open: open.value,
          onOpenChange: (value) => {
            open.value = value
          },
        }}
      />
    </div>
  )
})
