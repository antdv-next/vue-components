import type { CSSProperties, SlotsType } from 'vue'
import type {
  BeforeUploadFileType,
  RcFile,
  UploadProgressEvent,
  UploadRequestError,
} from './interface'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import clsx from 'classnames'
import { defineComponent, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import attrAccept from './attr-accept'
import { uploadProps } from './interface'
import defaultRequest from './request'
import traverseFileTree from './traverseFileTree'
import getUid from './uid'

interface ParsedFileInfo {
  origin: RcFile
  action: string | null
  data: Record<string, unknown> | null
  parsedFile: RcFile | null
}

export default defineComponent({
  name: 'AjaxUploader',
  props: {
    ...uploadProps(),
  },
  inheritAttrs: false,
  slots: Object as SlotsType<{
    default: any
  }>,
  setup(props, { expose, attrs, slots }) {
    const state = reactive({ uid: getUid() })
    const reqs: Record<string, any> = {}

    const fileInput = ref<HTMLInputElement | null>(null)
    const _isMounted = ref(true)

    const reset = () => {
      state.uid = getUid()
    }

    const abort = (file?: any) => {
      if (file) {
        const uid = file.uid ? file.uid : file
        if (reqs[uid] && reqs[uid].abort) {
          reqs[uid].abort()
        }
        delete reqs[uid]
      }
      else {
        Object.keys(reqs).forEach((uid) => {
          if (reqs[uid] && reqs[uid].abort) {
            reqs[uid].abort()
          }
          delete reqs[uid]
        })
      }
    }

    /**
     * Process file before upload. When all the file is ready, we start upload.
     */
    const processFile = async (file: RcFile, fileList: RcFile[]): Promise<ParsedFileInfo> => {
      const { beforeUpload } = props

      let transformedFile: BeforeUploadFileType | void = file
      if (beforeUpload) {
        try {
          transformedFile = await beforeUpload(file, fileList)
        }
        catch (e) {
          // Rejection will also trade as false
          transformedFile = false
        }
        if (transformedFile === false) {
          return {
            origin: file,
            parsedFile: null,
            action: null,
            data: null,
          }
        }
      }

      // Get latest action
      const { action } = props
      let mergedAction: string
      if (typeof action === 'function') {
        mergedAction = await action(file)
      }
      else {
        mergedAction = action || ''
      }

      // Get latest data
      const { data } = props
      let mergedData: Record<string, unknown>
      if (typeof data === 'function') {
        mergedData = await data(file)
      }
      else {
        mergedData = data || {}
      }

      const parsedData
        // string type is from legacy `transformFile`.
        // Not sure if this will work since no related test case works with it
        = (typeof transformedFile === 'object' || typeof transformedFile === 'string')
          && transformedFile
          ? transformedFile
          : file

      let parsedFile: File
      if (parsedData instanceof File) {
        parsedFile = parsedData
      }
      else {
        parsedFile = new File([parsedData], file.name, { type: file.type })
      }

      const mergedParsedFile: RcFile = parsedFile as RcFile
      mergedParsedFile.uid = file.uid

      return {
        origin: file,
        data: mergedData,
        parsedFile: mergedParsedFile,
        action: mergedAction,
      }
    }

    const post = ({ data, origin, action, parsedFile }: ParsedFileInfo) => {
      if (!_isMounted.value) {
        return
      }

      const { onStart, customRequest, name, headers, withCredentials, method } = props

      const { uid } = origin
      const request = customRequest || defaultRequest

      const requestOption = {
        action,
        filename: name,
        data,
        file: parsedFile,
        headers,
        withCredentials,
        method: method || 'post',
        onProgress: (e: UploadProgressEvent) => {
          const { onProgress } = props
          onProgress?.(e, parsedFile!)
        },
        onSuccess: (ret: any, xhr: XMLHttpRequest) => {
          const { onSuccess } = props
          onSuccess?.(ret, parsedFile!, xhr)

          delete reqs[uid]
        },
        onError: (err: UploadRequestError, ret: any) => {
          const { onError } = props
          onError?.(err, ret, parsedFile!)

          delete reqs[uid]
        },
      }

      onStart?.(origin)
      reqs[uid] = request(requestOption)
    }
    const uploadFiles = (files: File[]) => {
      const originFiles = [...files] as RcFile[]
      const postFiles = originFiles.map((file: RcFile & { uid?: string }) => {
        file.uid = getUid()
        return processFile(file, originFiles)
      })

      // Batch upload files
      Promise.all(postFiles).then((fileList) => {
        const { onBatchStart } = props

        onBatchStart?.(fileList.map(({ origin, parsedFile }) => ({ file: origin, parsedFile })))

        fileList
          .filter(file => file.parsedFile !== null)
          .forEach((file) => {
            post(file)
          })
      })
    }

    const onChange = (e: Event) => {
      const { accept, directory } = props
      const target = e.target as HTMLInputElement
      const { files } = target
      if (!files)
        return

      const acceptedFiles = [...files].filter(file => !directory || attrAccept(file as RcFile, accept!))
      uploadFiles(acceptedFiles)
      reset()
    }

    const onClick = (event: MouseEvent | KeyboardEvent) => {
      const el = fileInput.value
      if (!el) {
        return
      }

      const target = event.target as HTMLElement
      const { onClick } = props

      if (target && target.tagName === 'BUTTON') {
        const parent = el.parentNode as HTMLInputElement
        parent.focus()
        target.blur()
      }
      el.click()
      if (onClick) {
        onClick(event)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onClick(e)
      }
    }

    const onDataTransferFiles = async (dataTransfer: DataTransfer, existFileCallback?: () => void) => {
      const { multiple, accept, directory } = props

      const items: DataTransferItem[] = [...(dataTransfer.items || [])]
      let files: File[] = [...(dataTransfer.files || [])]

      if (files.length > 0 || items.some(item => item.kind === 'file')) {
        existFileCallback?.()
      }

      if (directory) {
        files = await traverseFileTree(Array.prototype.slice.call(items), (_file: RcFile) =>
          attrAccept(_file, props.accept!))
        uploadFiles(files)
      }
      else {
        let acceptFiles = [...files].filter(file => attrAccept(file as RcFile, accept!))

        if (multiple === false) {
          acceptFiles = files.slice(0, 1)
        }

        uploadFiles(acceptFiles)
      }
    }

    const onFilePaste = async (e: ClipboardEvent) => {
      const { pastable } = props

      if (!pastable) {
        return
      }

      if (e.type === 'paste') {
        const clipboardData = e.clipboardData
        return onDataTransferFiles(clipboardData!, () => {
          e.preventDefault()
        })
      }
    }

    const onFileDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const onFileDrop = async (e: DragEvent) => {
      e.preventDefault()

      if (e.type === 'drop') {
        const dataTransfer = e.dataTransfer

        return onDataTransferFiles(dataTransfer!)
      }
    }

    onMounted(() => {
      _isMounted.value = true

      const { pastable } = props

      if (pastable) {
        document.addEventListener('paste', onFilePaste)
      }
    })

    onUnmounted(() => {
      _isMounted.value = false
      abort()
      document.removeEventListener('paste', onFilePaste)
    })

    watch(() => props.pastable, (newVal, oldVal) => {
      if (newVal && !oldVal) {
        document.addEventListener('paste', onFilePaste)
      }
      else if (!newVal && oldVal) {
        document.removeEventListener('paste', onFilePaste)
      }
    })

    expose({
      abort,
    })

    return () => {
      const {
        component: Tag = 'div',
        prefixCls,
        disabled,
        id,
        name,
        multiple,
        accept,
        capture,
        directory,
        folder,
        openFileDialogOnClick,
        onMouseenter,
        onMouseleave,
        hasControlInside,
        ...otherProps
      } = props

      const cls = clsx({
        [prefixCls!]: true,
        [`${prefixCls}-disabled`]: disabled,
      }, [attrs.class])

      // because input don't have directory/webkitdirectory type declaration
      const dirProps: any = directory || folder
        ? { directory: 'directory', webkitdirectory: 'webkitdirectory' }
        : {}

      const events = disabled
        ? {}
        : {
            onClick: openFileDialogOnClick ? onClick : () => {},
            onKeydown: openFileDialogOnClick ? onKeyDown : () => {},
            onMouseenter,
            onMouseleave,
            onDrop: onFileDrop,
            onDragover: onFileDragOver,
            tabIndex: hasControlInside ? undefined : '0',
          }

      return (
        <Tag
          {...events}
          class={cls}
          role={hasControlInside ? undefined : 'button'}
          style={{ ...attrs.style as CSSProperties }}
        >
          <input
            {...pickAttrs({ ...otherProps, ...attrs }, { aria: true, data: true })}
            id={id}
            /**
             * https://github.com/ant-design/ant-design/issues/50643,
             * https://github.com/react-component/upload/pull/575#issuecomment-2320646552
             */
            name={name}
            disabled={disabled}
            type="file"
            ref={fileInput}
            onClick={e => e.stopPropagation()} // https://github.com/ant-design/ant-design/issues/19948
            key={state.uid}
            style={{ display: 'none' }}
            accept={accept}
            {...dirProps}
            multiple={multiple}
            onChange={onChange}
            {...(capture != null ? { capture } : {})}
          />
          {slots.default?.()}
        </Tag>
      )
    }
  },
})
