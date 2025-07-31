<script setup lang="ts">
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
  onStart(file: any) {
    console.log('onStart', file, file.name)
  },
  onSuccess(ret: any) {
    console.log('onSuccess', ret)
  },
  onError(err: any) {
    console.log('onError', err)
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
  </Story>
</template>
