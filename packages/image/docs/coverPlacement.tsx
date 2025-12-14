import type { CoverConfig } from '../src'
import { defineComponent, ref } from 'vue'
import Image from '../src'
import { defaultIcons } from './assets/common'

export default defineComponent(() => {
  const placement = ref<CoverConfig['placement']>('center')

  return () => (
    <div>
      <div>
        <label for="placement">
          <span>placement:</span>
        </label>
        <select
          id="placement"
          value={placement.value}
          onChange={(e) => {
            placement.value = (e.target as HTMLSelectElement).value as CoverConfig['placement']
          }}
        >
          <option value="top">
            top
          </option>
          <option value="bottom">
            bottom
          </option>
          <option value="center">
            center
          </option>
        </select>
      </div>

      <br />

      <Image
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        width={200}
        onClick={() => {
          console.log('click')
        }}
        preview={{
          icons: defaultIcons,
          onOpenChange: (open) => {
            console.log('open', open)
          },
          zIndex: 9999,
          cover: {
            coverNode: 'Click to Preview',
            placement: placement.value,
          },
        }}
      />
    </div>
  )
})
