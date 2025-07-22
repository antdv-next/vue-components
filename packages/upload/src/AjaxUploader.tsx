import type { DefineComponent } from 'vue'
import type { BeforeUploadFileType, UploadProgressEvent, UploadProps, UploadRequestError, VcFile } from './interface'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import clsx from 'classnames'
import { computed, defineComponent, ref } from 'vue'
import attrAccept from './attrAccept'
import { generatorUploadProps } from './interface'
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

export const AjaxUploader = defineComponent<UploadProps>({
  props: generatorUploadProps(),
  setup(props, { attrs }) {
    const uid = ref(getUid())
    const _isMounted = false

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
          onError?.(err, ret, parsedFile)

          delete reqs[uid]
        },
      }

      onStart?.(origin)
      reqs[uid] = request(requestOption)
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

      const { multiple, accept, directory } = props

      const items: DataTransferItem[] = [...(dataTransfer.items || [])]
      let files: File[] = [...(dataTransfer.files || [])]

      if (files.length > 0 || items.some(item => item.kind === 'file')) {
        existFileCallback?.()
      }

      if (directory) {
        files = await traverseFileTree(Array.prototype.slice.call(items), (_file: VcFile) =>
          attrAccept(_file, accept))
        uploadFiles(files)
      }
      else {
        let acceptFiles = [...files].filter((file: File) => attrAccept(file as VcFile, accept))

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

    // ==============================================================

    const dirProps = computed(() => {
      return props.directory ? { directory: 'directory', webkitdirectory: 'webkitdirectory' } : {}
    })

    const events = computed(() => {
      return props.disabled
        ? {}
        : {
            onClick: props.openFileDialogOnClick ? onClick : noop,
            onKeyDown: props.openFileDialogOnClick ? onKeyDown : noop,
            onMouseEnter: props.onMouseEnter,
            onMouseLeave: props.onMouseLeave,
          }
    })

    return () => {
      // FIXME 暂时没有找到优化的方法
      const Tag = props.component as DefineComponent
      const {
        component,
        prefixCls,
        className,
        classNames = {},
        disabled, // 注意原来是 disbaled，修正拼写
        id,
        name,
        style,
        styles = {},
        multiple,
        accept,
        capture,
        // children,
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
      return (
        <Tag class={cls.value} {...events.value} role={hasControlInside ? undefined : 'button'} style={style}>
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
            accept={accept}
            {...(capture != null ? { capture } : {})}
          />
        </Tag>
      )
    }
  },
})
