<script setup lang="ts">
import { ref } from 'vue'
import Upload from '../src'

const destroyed = ref(false)

const uploaderProps = {
  action: '/upload.do',
  data: { a: 1, b: 2 },
  multiple: true,
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
  capture: 'user',
}
</script>

<template>
  <div style="margin: 100px">
    <h2>固定位置</h2>
    <div>
      <Upload v-bind="uploaderProps">
        <a>开始上传</a>
      </Upload>
    </div>
    <h2>滚动</h2>
    <div style="height: 200px; overflow: auto; border: 1px solid red" />
    <div
      style="height: 500px"
    >
      <Upload v-bind="uploaderProps" id="test" component="div" style="display: inline-block">
        <a>开始上传2</a>
      </Upload>
    </div>
    <button type="button" @click="destroyed = true">
      destroy
    </button>
  </div>
</template>

<style scoped>
.vc-upload-disabled {
  opacity: 0.5;
}
</style>
