import { defineComponent } from 'vue'

const Input = defineComponent((_, { attrs }) => {
  return () => {
    return <input {...attrs} />
  }
})

const CustomizeInput = defineComponent<{ value: any }>((props, { attrs }) => {
  return () => {
    const { value } = props
    return (
      <div style={{ padding: '10px' }}>
        <Input style={{ outline: 'none' }} value={value} {...attrs} />
      </div>
    )
  }
})

export default CustomizeInput
