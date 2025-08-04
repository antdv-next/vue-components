<script setup lang="ts">
import type { UploadRequestOption } from '../src/interface.ts'
import axios from 'axios'
import Upload from '../src'

const uploadProps = {
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
  onProgress({ percent }: { percent: any }, file: any) {
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
    // EXAMPLE: post form-data with 'axios'

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
  <div>
    <Upload v-bind="uploadProps">
      <button>Upload</button>
    </Upload>
  </div>
</template>

<style scoped>
</style>
