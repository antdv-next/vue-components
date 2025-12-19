import type { AjaxUploaderExpose, UploadProps, VcFile } from './interface'
import { computed, defineComponent, ref } from 'vue'
import AjaxUpload from './AjaxUploader'

function empty() {}

const defaults = {
  component: 'span',
  prefixCls: 'vc-upload',
  data: {},
  headers: {},
  name: 'file',
  onStart: empty,
  onError: empty,
  onSuccess: empty,
  multiple: false,
  beforeUpload: undefined,
  customRequest: undefined,
  withCredentials: false,
  openFileDialogOnClick: true,
  hasControlInside: false,
} satisfies UploadProps

const Upload = defineComponent<UploadProps>(
  (props = defaults, { attrs, expose, slots }) => {
    const uploaderRef = ref<AjaxUploaderExpose>()
    const abort = (file: VcFile) => {
      uploaderRef.value?.abort(file)
    }
    expose({ abort })

    const mergedProps = computed(() => ({
      ...defaults,
      ...props,
    }))

    return () => (
      <AjaxUpload ref={uploaderRef} {...mergedProps.value} {...attrs}>
        {slots.default?.()}
      </AjaxUpload>
    )
  },
  { name: 'Upload' },
)

export default Upload
