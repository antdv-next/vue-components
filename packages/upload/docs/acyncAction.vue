<script setup lang="ts">
import Upload from '../src'

const props = {
  action: () => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve('/upload.do')
      }, 2000)
    })
  },
  multiple: true,
  onStart(file) {
    console.log('onStart', file, file.name)
  },
  onSuccess(ret) {
    console.log('onSuccess', ret)
  },
  onError(err) {
    console.log('onError', err)
  },
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
