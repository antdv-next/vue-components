<script setup lang="ts">
import Upload from '../src'

const uploaderProps = {
  action: '/upload.do',
  data: { a: 1, b: 2 },
  directory: true,
  beforeUpload(file) {
    console.log('beforeUpload', file.name)
  },
  onStart: (file) => {
    console.log('onStart', file.name)
  },
  onSuccess(file) {
    console.log('onSuccess', file)
  },
  onProgress(step, file) {
    console.log('onProgress', Math.round(step.percent), file.name)
  },
  onError(err) {
    console.log('onError', err)
  },
}
</script>

<template>
  <div style="margin: 100px">
    <div>
      <Upload v-bind="uploaderProps">
        <a>开始上传</a>
      </Upload>
    </div>
  </div>
</template>

<style scoped>

</style>
