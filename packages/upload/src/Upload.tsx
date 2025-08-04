import type { SlotsType } from 'vue'
import { defineComponent, ref } from 'vue'
import AjaxUpload from './AjaxUploader'
import { uploadProps } from './interface.ts'

const Upload = defineComponent({
  name: 'Upload',
  props: {
    ...uploadProps(),
    component: { type: [String, Object], default: 'span' },
    prefixCls: { type: String, default: 'vc-upload' },
    data: { type: [Object, Function], default: () => ({}) },
    headers: { type: Object, default: () => ({}) },
    name: { type: String, default: 'file' },
    multipart: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    withCredentials: { type: Boolean, default: false },
    openFileDialogOnClick: { type: Boolean, default: true },
    hasControlInside: { type: Boolean, default: false },
    beforeUpload: { type: Function, default: null },
    customRequest: { type: Function, default: null },
    onStart: { type: Function, default: () => {} },
    onError: { type: Function, default: () => {} },
    onSuccess: { type: Function, default: () => {} },
  },
  slots: Object as SlotsType<{
    default: any
  }>,
  setup(props, { attrs, expose, slots }) {
    const uploaderRef = ref()

    const abort = (file: any) => {
      if (uploaderRef.value && uploaderRef.value.abort) {
        uploaderRef.value.abort(file)
      }
    }

    expose({
      abort,
    })

    return () => {
      return <AjaxUpload {...props} {...attrs} ref={uploaderRef} v-slots={slots} />
    }
  },
})

export default Upload
