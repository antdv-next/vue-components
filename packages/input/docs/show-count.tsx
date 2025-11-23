import { defineComponent } from 'vue'
import Input from '../src'

const sharedHeadStyle = {
  margin: 0,
  padding: 0,
}

export default defineComponent(() => {
  return () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'start',
      }}
    >
      <h3 style={sharedHeadStyle}>Native</h3>
      <Input prefixCls="vc-input" showCount defaultValue="👨‍👩‍👧‍👦" />
      <Input prefixCls="vc-input" showCount defaultValue="👨‍👩‍👧‍👦" maxLength={20} />
      <h3 style={sharedHeadStyle}>Count</h3>
      <h4 style={sharedHeadStyle}>Only Max</h4>
      <Input
        placeholder="count.max"
        prefixCls="vc-input"
        defaultValue="🔥"
        count={{
          show: true,
          max: 5,
        }}
      />
      <h4 style={sharedHeadStyle}>Customize strategy</h4>
      <Input
        placeholder="Emoji count 1"
        prefixCls="vc-input"
        defaultValue="🔥"
        count={{
          show: true,
          max: 5,
          // @ts-expect-error this
          strategy: (val: string) => [...new Intl.Segmenter().segment(val)].length,
        }}
      />
      <h4 style={sharedHeadStyle}>Customize exceedFormatter</h4>

      <Input
        placeholder="Emoji count 1"
        prefixCls="vc-input"
        defaultValue="🔥"
        count={{
          show: true,
          max: 5,
          exceedFormatter: (val: string, { max }: { max: number }) => {
            // @ts-expect-error this
            const segments = [...new Intl.Segmenter().segment(val)]

            return segments
              .filter(seg => seg.index + seg.segment.length <= max)
              .map(seg => seg.segment)
              .join('')
          },
        }}
      />
    </div>
  )
})
