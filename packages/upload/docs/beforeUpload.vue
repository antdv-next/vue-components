<script setup lang="ts">
import Upload from '../src'

const props = {
  action: '/upload.do',
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
  beforeUpload(file, fileList) {
    console.log(file, fileList)
    return new Promise<string>((resolve) => {
      console.log('start check')
      setTimeout(() => {
        console.log('check finshed')
        resolve(file)
      }, 3000)
    })
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
