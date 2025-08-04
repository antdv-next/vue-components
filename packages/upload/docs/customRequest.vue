<script setup lang="ts">
import type { UploadProps } from '../src'
import axios from 'axios'
import { ref } from 'vue'
import Upload from '../src'

const fileList = ref<any[]>([])

const customRequest: UploadProps['customRequest'] = ({ action, data, file, filename, headers, onError, onProgress, onSuccess, withCredentials, }) => {
  // EXAMPLE: post form-data with 'axios'

  const formData = new FormData()
  if (data) {
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key] as string)
    })
  }
  formData.append(filename, file)

  axios
    .post(action, formData, {
      withCredentials,
      headers,
      onUploadProgress: ({ total, loaded }) => {
        onProgress({ percent: Number(Math.round((loaded / total) * 100).toFixed(2)) }, file)
      },
    })
    .then(({ data: response }) => {
      onSuccess(response, file)
    })
    .catch(onError)

  return {
    abort() {
      console.log('upload progress is aborted.')
    },
  }
}

function handleChange(info: any) {
  let fileListTemp = [...info.fileList]

  // 限制文件数量为1
  fileListTemp = fileListTemp.slice(-1)

  fileList.value = fileListTemp
}
</script>

<template>
  <div>
    <Upload
      v-model:file-list="fileList"
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      :custom-request="customRequest"
      @change="handleChange"
    >
      <button>Upload</button>
    </Upload>
  </div>
</template>

<style scoped>
</style>
