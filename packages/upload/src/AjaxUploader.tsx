import type { VNode } from 'vue'
import type { AcceptConfig, AjaxUploaderExpose, BeforeUploadFileType, UploadProgressEvent, UploadProps, UploadRequestError, UploadRequestOption, VcFile } from './interface'
import { classNames as clsx } from '@v-c/util'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { computed, defineComponent, onMounted, onUnmounted, onUpdated, ref } from 'vue'
import attrAccept from './attrAccept'
import defaultRequest from './request'
import traverseFileTree from './traverseFileTree'
import getUid from './uid'

function noop() { }

interface ParsedFileInfo {
  origin: VcFile
  action: string | null
  data: Record<string, unknown> | null
  parsedFile: VcFile | null
}

const AjaxUploader = defineComponent<UploadProps>(
  (props, { attrs, expose, slots }) => {
    const uid = ref(getUid())
    let _isMounted = false

    const reqs: Record<string, any> = {}
    const fileInputRef = ref<HTMLInputElement>()

    const cls = computed(() => {
      const { prefixCls, disabled, className } = props

      return clsx({
        [prefixCls!]: true,
        [`${prefixCls}-disabled`]: disabled,
        [className!]: className,
      })
    })

    const filterFile = (file: VcFile | File, force = false) => {
      const { accept, directory } = props

      let filterFn: Exclude<AcceptConfig['filter'], 'native'> | undefined
      let acceptFormat: string | undefined

      if (typeof accept === 'string') {
        acceptFormat = accept
      }
      else {
        const { filter, format } = accept || {}

        acceptFormat = format
        if (filter === 'native') {
          filterFn = () => true
        }
        else {
          filterFn = filter
        }
      }

      const mergedFilter
        = filterFn
          || (directory || force
            ? (currentFile: VcFile) => attrAccept(currentFile, acceptFormat)
            : () => true)

      return mergedFilter(file as VcFile)
    }

    // ================== internal api ===========================
    const onClick = (event: MouseEvent | KeyboardEvent) => {
      if (!fileInputRef.value) {
        return
      }

      const target = event.target as HTMLElement

      if (target && target.tagName === 'BUTTON') {
        const parent = fileInputRef.value.parentNode as HTMLInputElement
        parent.focus()
        target.blur()
      }

      fileInputRef.value.click()

      if (props.onClick) {
        props.onClick(event)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onClick(e)
      }
    }

    const post = ({ data, origin, action, parsedFile }: ParsedFileInfo) => {
      if (!_isMounted) {
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
          onProgress?.(e, parsedFile)
        },
        onSuccess: (ret: any, xhr: XMLHttpRequest) => {
          const { onSuccess } = props
          onSuccess?.(ret, parsedFile, xhr)

          delete reqs[uid]
        },
        onError: (err: UploadRequestError, ret: any) => {
          const { onError } = props
          onError?.(err as UploadRequestError, ret, parsedFile)

          delete reqs[uid]
        },
      } as UploadRequestOption

      onStart?.(origin)
      reqs[uid] = request(requestOption, { defaultRequest })
    }

    /**
     * Process file before upload. When all the file is ready, we start upload.
     */
    const processFile = async (file: VcFile, fileList: VcFile[]): Promise<ParsedFileInfo> => {
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
        mergedAction = action!
      }

      // Get latest data
      const { data } = props
      let mergedData: Record<string, unknown>
      if (typeof data === 'function') {
        mergedData = await data(file)
      }
      else {
        mergedData = data!
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

      const mergedParsedFile: VcFile = parsedFile as VcFile
      mergedParsedFile.uid = file.uid

      return {
        origin: file,
        data: mergedData,
        parsedFile: mergedParsedFile,
        action: mergedAction,
      }
    }

    const uploadFiles = (files: File[]) => {
      const originFiles = [...files] as VcFile[]
      const postFiles = originFiles.map((file: VcFile & { uid?: string }) => {
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

    const onDataTransferFiles = async (dataTransfer: DataTransfer | null, existFileCallback?: () => void) => {
      if (!dataTransfer)
        return

      const { multiple, directory } = props

      const items: DataTransferItem[] = [...(dataTransfer.items || [])]
      let files: File[] = [...(dataTransfer.files || [])]

      if (files.length > 0 || items.some(item => item.kind === 'file')) {
        existFileCallback?.()
      }

      if (directory) {
        files = await traverseFileTree(
          Array.prototype.slice.call(items),
          (currentFile: VcFile) => filterFile(currentFile),
        )
        uploadFiles(files)
      }
      else {
        let acceptFiles = [...files].filter(file => filterFile(file, true))

        if (multiple === false) {
          acceptFiles = files.slice(0, 1)
        }

        uploadFiles(acceptFiles)
      }
    }

    const onFileDrop = (e: DragEvent) => {
      e.preventDefault()

      if (e.type === 'drop') {
        const dataTransfer = e.dataTransfer

        return onDataTransferFiles(dataTransfer)
      }
    }
    const onFileDragOver = (e: DragEvent) => {
      e.preventDefault()
    }
    const reset = () => {
      uid.value = getUid()
    }

    const onChange = (e: Event) => {
      const { files } = e.target as HTMLInputElement
      const acceptedFiles = [...(files || [])].filter(file => filterFile(file))
      uploadFiles(acceptedFiles)
      reset()
    }

    // ==============================================================

    const dirProps = computed(() => {
      return props.directory ? { directory: 'directory', webkitdirectory: 'webkitdirectory' } : {}
    })

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

    const events = computed(() => {
      return props.disabled
        ? {}
        : {
            onClick: props.openFileDialogOnClick ? onClick : noop,
            onKeyDown: props.openFileDialogOnClick ? onKeyDown : noop,
            onMouseEnter: props.onMouseEnter,
            onMouseLeave: props.onMouseLeave,
            onDrop: onFileDrop,
            onDragover: onFileDragOver,
            tabIndex: props.hasControlInside ? undefined : '0',
          }
    })

    const onFilePaste = async (e: ClipboardEvent) => {
      const { pastable } = props

      if (!pastable) {
        return
      }

      if (e.type === 'paste') {
        const clipboardData = (e as ClipboardEvent).clipboardData
        return onDataTransferFiles(clipboardData, () => {
          e.preventDefault()
        })
      }
    }

    let prevPastable: boolean | undefined

    onMounted(() => {
      _isMounted = true

      if (props.pastable) {
        document.addEventListener('paste', onFilePaste)
      }

      prevPastable = props.pastable
    })

    onUpdated(() => {
      const pastable = props.pastable
      if (pastable && !prevPastable) {
        document.addEventListener('paste', onFilePaste)
      }
      else if (!pastable && prevPastable) {
        document.removeEventListener('paste', onFilePaste)
      }
      prevPastable = pastable
    })

    onUnmounted(() => {
      _isMounted = false
      abort()
      document.removeEventListener('paste', onFilePaste)
    })

    return () => {
      const {
        component,
        prefixCls,
        className,
        classNames = {},
        disabled,
        id,
        name,
        style,
        styles = {},
        multiple,
        accept,
        capture,
        directory,
        openFileDialogOnClick,
        onMouseEnter,
        onMouseLeave,
        hasControlInside,
        ...otherProps
      } = {
        ...props,
        ...attrs,
      }
      const acceptFormat = typeof accept === 'string' ? accept : accept?.format
      // 处理自定义组件
      const Tag = component as {
        new: () => VNode
      }

      const instance: AjaxUploaderExpose = {
        abort,
      }
      expose(instance)
      return (
        <component is={Tag} class={cls.value} {...events.value} role={hasControlInside ? undefined : 'button'} style={style}>
          <input
            {...pickAttrs(otherProps, { aria: true, data: true })}
            id={id}
            name={name}
            disabled={disabled}
            type="file"
            ref={fileInputRef}
            onClick={e => e.stopPropagation()}
            key={uid.value}
            style={{ display: 'none', ...styles.input }}
            class={classNames.input}
            {...dirProps.value}
            multiple={multiple}
            accept={acceptFormat}
            onChange={onChange}
            {...(capture != null ? { capture } : {})}
          />
          {slots.default?.()}
        </component>
      )
    }
  },
)

export default AjaxUploader
