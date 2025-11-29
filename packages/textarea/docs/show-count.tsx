import { defineComponent } from 'vue'
import Textarea from '../src_'
import './assets/index.less'

export default defineComponent(() => {
  return () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'start' }}>
      <Textarea prefixCls="vc-textarea" showCount defaultValue="👨‍👩‍👧‍👦" />
      <Textarea prefixCls="vc-textarea" showCount defaultValue="👨‍👩‍👧‍👦" maxLength={20} />
      <Textarea
        prefixCls="vc-textarea"
        defaultValue="🔥"
        count={{ show: true, max: 5 }}
        placeholder="count.max"
      />
      <Textarea
        prefixCls="vc-textarea"
        defaultValue="🔥"
        count={{
          show: true,
          max: 5,
          strategy: (val: string) => [...new Intl.Segmenter().segment(val)].length,
        }}
        placeholder="Emoji count 1"
      />
      <Textarea
        prefixCls="vc-textarea"
        defaultValue="🔥"
        count={{
          show: true,
          max: 5,
          exceedFormatter: (val: string, { max }: { max: number }) => {
            const segments = [...new Intl.Segmenter().segment(val)]
            return segments
              .filter(seg => seg.index + seg.segment.length <= max)
              .map(seg => seg.segment)
              .join('')
          },
        }}
        placeholder="Emoji count 1"
      />
    </div>
  )
})
