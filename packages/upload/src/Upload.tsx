import type { AjaxUploaderExpose, UploadProps, VcFile } from './interface'
import { defineComponent, ref } from 'vue'
import AjaxUpload from './AjaxUploader'
import { generatorUploadProps } from './interface'

const Upload = defineComponent<UploadProps>({
  name: 'Upload',
  props: {
    ...generatorUploadProps(),
    component: { type: String, default: 'span' },
    prefixCls: { type: String, default: 'vc-upload' },
    data: { type: Object, default: () => ({}) },
    headers: { type: Object, default: () => ({}) },
    name: { type: String, default: 'file' },
    multipart: { type: Boolean, default: false },
    onStart: { type: Function, default: () => { } },
    onError: { type: Function, default: () => { } },
    onSuccess: { type: Function, default: () => { } },
    multiple: { type: Boolean, default: false },
    beforeUpload: { type: Function, default: null },
    customRequest: { type: Function, default: null },
    withCredentials: { type: Boolean, default: false },
    openFileDialogOnClick: { type: Boolean, default: true },
    hasControlInside: { type: Boolean, default: false },
  },
  setup(props, { attrs, expose, slots }) {
    const uploaderRef = ref<AjaxUploaderExpose>()
    const abort = (file: VcFile) => {
      uploaderRef.value?.abort(file)
    }
    expose({ abort })

    return () => (
      <AjaxUpload ref={uploaderRef} {...props} {...attrs}>
        {slots.default?.()}
      </AjaxUpload>
    )
  },
})

export default Upload
