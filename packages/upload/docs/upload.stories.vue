<script setup lang="ts">
import type { Action, UploadRequestOption, VcFile } from '../src/interface'
import axios from 'axios'
import Upload from '../src/Upload'

const asyncActionProps = {
  action: () => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve('/upload.do')
      }, 2000)
    })
  },
  multiple: true,
  onStart(file: VcFile) {
    console.log('onStart', file, file.name)
  },
  onSuccess(ret: Record<string, unknown>) {
    console.log('onSuccess', ret)
  },
  onError(err: Error) {
    console.log('onError', err)
  },
}

const beforeUploadProps = {
  action: '/upload.do' as Action,
  multiple: true,
  onStart(file: VcFile) {
    console.log('onStart', file, file.name)
  },
  onSuccess(ret: Record<string, unknown>) {
    console.log('onSuccess', ret)
  },
  onError(err: Error) {
    console.log('onError', err)
  },
  beforeUpload(file: VcFile, fileList: VcFile[]) {
    console.log(file, fileList)
    return new Promise<VcFile>((resolve) => {
      console.log('start check')
      setTimeout(() => {
        console.log('check finshed', file)
        resolve(file)
      }, 3000)
    })
  },
}

// ==================== customRequest =====================
const customRequestUploadProps = {
  action: '/upload.do',
  multiple: false,
  data: { a: 1, b: 2 },
  headers: {
    Authorization: '$prefix $token',
  },
  onStart(file: any) {
    console.log('onStart', file, file.name)
  },
  onSuccess(res: any, file: any) {
    console.log('onSuccess', res, file.name)
  },
  onError(err: any) {
    console.log('onError', err)
  },
  onProgress({ percent }: { percent?: any }, file: any) {
    console.log('onProgress', `${percent}%`, file.name)
  },
  customRequest({
    action,
    data,
    file,
    filename,
    headers,
    onError,
    onProgress,
    onSuccess,
    withCredentials,
  }: UploadRequestOption) {
    const formData = new FormData()
    if (data) {
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key] as string)
      })
    }
    formData.append(filename!, file)
    axios
      .post(action, formData, {
        withCredentials,
        headers,
        onUploadProgress: ({ total, loaded }) => {
          onProgress?.({ percent: Number(Math.round((loaded / total!) * 100).toFixed(2)) }, file)
        },
      })
      .then(({ data: response }) => {
        onSuccess?.(response, file)
      })
      .catch(onError)

    return {
      abort() {
        console.log('upload progress is aborted.')
      },
    }
  },
}
</script>

<template>
  <Story title="Upload">
    <Variant title="asyncAction">
      <div style="margin: 100px">
        <div>
          <Upload v-bind="asyncActionProps">
            <a>开始上传</a>
          </Upload>
        </div>
      </div>
    </Variant>

    <Variant title="beforeUpload">
      <div style="margin: 100px">
        <div>
          <Upload v-bind="beforeUploadProps">
            <a>开始上传</a>
          </Upload>
        </div>
      </div>
    </Variant>

    <Variant title="customRequest">
      <div style="margin: 100px">
        <div>
          <Upload v-bind="customRequestUploadProps">
            <a>开始上传</a>
          </Upload>
        </div>
      </div>
    </Variant>
  </Story>
</template>
