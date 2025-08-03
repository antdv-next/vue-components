<script setup lang="ts">
import Upload from '../src/Upload'
import type { Action, VcFile } from '../src/interface';


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
  onSuccess(ret:Record<string, unknown>) {
    console.log('onSuccess', ret)
  },
  onError(err: Error) {
    console.log('onError', err)
  },
}

const beforeUploadProps = {
   action: '/upload.do' as Action,
  multiple: true,
  onStart(file:VcFile) {
    console.log('onStart', file, file.name);
  },
  onSuccess(ret:Record<string, unknown>) {
    console.log('onSuccess', ret);
  },
  onError(err:Error) {
    console.log('onError', err);
  },
  beforeUpload(file:VcFile, fileList:VcFile[]) {
    console.log(file, fileList);
    return new Promise<VcFile>(resolve => {
      console.log('start check');
      setTimeout(() => {
        console.log('check finshed',file);
        resolve(file);
      }, 3000);
    });
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
      <div
        style="margin: 100px"
      >
        <div>
          <Upload v-bind="beforeUploadProps">
            <a>开始上传</a>
          </Upload>
        </div>
      </div>
    </Variant>
  </Story>
</template>
