<script setup lang="ts">
import Upload from '../src'

const props = {
  action: '/upload.do',
  type: 'drag',
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
  style: { display: 'inline-block', width: '200px', height: '200px', background: '#eee' },
  // openFileDialogOnClick: false
}
</script>

<template>
  <div style="margin: 100px">
    <div>
      <Upload v-bind="props">
        <a>开始上传</a>
      </Upload>
    </div>
  </div>
</template>

<style scoped>

</style>
