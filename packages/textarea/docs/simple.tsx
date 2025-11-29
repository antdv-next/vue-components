import type { TextAreaProps } from '../src_/interface'
import { defineComponent, ref } from 'vue'
import Textarea from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const value = ref('')

  const onChange = (e: Event) => {
    const currentValue = (e.target as HTMLTextAreaElement).value
    console.log(currentValue)
    value.value = currentValue
  }

  const onResize: TextAreaProps['onResize'] = ({ width, height }) => {
    console.log(`size is changed, width:${width} height:${height}`)
  }

  const onPressEnter = () => {
    console.log('enter key is pressed')
  }

  return () => (
    <div>
      <Textarea
        prefixCls="custom-textarea"
        onPressEnter={onPressEnter}
        onResize={onResize}
        value={value.value}
        onChange={onChange}
        autoFocus
        onFocus={() => console.log('focus')}
        onKeydown={() => {
          console.log('onKeydown')
        }}
        onKeyup={() => {
          console.log('onKeyup')
        }}
      />
    </div>
  )
})
