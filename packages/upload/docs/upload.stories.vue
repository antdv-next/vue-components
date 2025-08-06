<script setup lang="ts">
import type {
  Action,
  UploadProps,
  UploadRequestOption,
  VcFile,
} from '../src/interface'
import axios from 'axios'
import { ref } from 'vue'
import Upload from '../src/Upload'
import './assets/index.less'

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
  onProgress({ percent }: { percent?: any }, file: VcFile | null) {
    console.log('onProgress', `${percent}%`, file?.name)
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
        onUploadProgress: ({
          total,
          loaded,
        }) => {
          onProgress?.(
            { percent: Number(Math.round((loaded / total!) * 100).toFixed(2)) },
            file,
          )
        },
      })
      .then(({ data: response }: { data: unknown }) => {
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

const directoryUploadProps = {
  action: '/upload.do',
  data: { a: 1, b: 2 },
  directory: true,
  beforeUpload(file: VcFile) {
    console.log('beforeUpload', file.name)
  },
  onStart: (file: VcFile) => {
    console.log('onStart', file.name)
  },
  onSuccess(file: any) {
    console.log('onSuccess', file)
  },
  onProgress(step: { percent?: number }, file: VcFile | null) {
    console.log('onProgress', Math.round(step.percent || 0), file?.name)
  },
  onError(err: Error) {
    console.log('onError', err)
  },
}

// ================ drag props ====================
const dragProps = {
  action: '/upload.do',
  type: 'drag',
  accept: '.png',
  beforeUpload(file: VcFile) {
    console.log('beforeUpload', file.name)
  },
  onStart: (file: VcFile) => {
    console.log('onStart', file.name)
  },
  onSuccess(ret: Record<string, unknown>) {
    console.log('onSuccess', ret)
  },
  onProgress(step: { percent?: number }, file: VcFile | null) {
    console.log('onProgress', Math.round(step.percent || 0), file?.name)
  },
  onError(err: Error) {
    console.log('onError', err)
  },
  style: {
    display: 'inline-block',
    width: 200,
    height: 200,
    background: '#eee',
  },
}

// ======================== drag directory =====================
const dragDirectoryProps = {
  action: '/upload.do',
  type: 'drag',
  directory: true,
  beforeUpload(file: VcFile, fileList: VcFile[]) {
    console.log('beforeUpload', file.name, fileList)
  },
  onStart: (file: VcFile) => {
    console.log('onStart', file.name)
  },
  onSuccess(ret: Record<string, unknown>) {
    console.log('onSuccess', ret)
  },
  onProgress(step: { percent?: number }, file: VcFile | null) {
    console.log('onProgress', Math.round(step.percent || 0), file?.name)
  },
  onError(err: Error) {
    console.log('onError', err)
  },
  style: {
    display: 'inline-block',
    width: 200,
    height: 200,
    background: '#eee',
  },
}

// ======================= paste  =================================
const pasteProps = {
  action: '/upload.do',
  type: 'drag',
  accept: '.png',
  pastable: true,
  beforeUpload(file: VcFile) {
    console.log('beforeUpload', file.name)
  },
  onStart: (file: VcFile) => {
    console.log('onStart', file.name)
  },
  onSuccess(ret: Record<string, unknown>) {
    console.log('onSuccess', ret)
  },
  onProgress(step: { percent?: number }, file: VcFile | null) {
    console.log('onProgress', Math.round(step.percent || 0), file?.name || '')
  },
  onError(err: Error) {
    console.log('onError', err)
  },
  style: {
    display: 'inline-block',
    width: 200,
    height: 200,
    background: '#eee',
  },
}

// ====================== paste directory ====================
const pasteDirectoryProps = {
  action: '/upload.do',
  type: 'drag',
  accept: '.png',
  directory: true,
  pastable: true,
  beforeUpload(file: VcFile) {
    console.log('beforeUpload', file.name)
  },
  onStart: (file: VcFile) => {
    console.log('onStart', file.name)
  },
  onSuccess(ret: Record<string, unknown>) {
    console.log('onSuccess', ret)
  },
  onProgress(step: { percent?: number }, file: VcFile | null) {
    console.log('onProgress', Math.round(step.percent || 0), file?.name || '')
  },
  onError(err: Error) {
    console.log('onError', err)
  },
  style: {
    display: 'inline-block',
    width: 200,
    height: 200,
    background: '#eee',
  },
}

// ================== simple ======================

const simpleUploaderProps: UploadProps = {
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
    console.log('onProgress', Math.round(step.percent || 0), file?.name || '')
  },
  onError(err) {
    console.log('onError', err)
  },
  capture: 'user',
}

const destroy = ref(false)
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

    <Variant title="directoryUpload">
      <div style="margin: 100px">
        <div>
          <Upload v-bind="directoryUploadProps">
            <a>开始上传</a>
          </Upload>
        </div>
      </div>
    </Variant>

    <Variant title="drag">
      <div style="margin: 100px">
        <div>
          <Upload v-bind="dragProps">
            <a>开始上传</a>
          </Upload>
        </div>
      </div>
    </Variant>

    <Variant title="dragDirectory">
      <div style="margin: 100px">
        <div>
          <Upload v-bind="dragDirectoryProps">
            <a>开始上传</a>
          </Upload>
        </div>
      </div>
    </Variant>

    <Variant title="paste">
      <div style="margin: 100px">
        <div>
          <Upload v-bind="pasteProps">
            <a>开始上传</a>
          </Upload>
        </div>
      </div>
    </Variant>

    <Variant title="pasteDirectory">
      <div style="margin: 100px">
        <div>
          <Upload v-bind="pasteDirectoryProps">
            <a>开始上传</a>
          </Upload>
        </div>
      </div>
    </Variant>

    <Variant title="simple">
      <div v-if="destroy" style="margin: 100px">
        <h2>固定位置</h2>

        <div>
          <Upload v-bind="simpleUploaderProps">
            <a>开始上传</a>
          </Upload>
        </div>

        <h2>滚动</h2>

        <div
          :style="{
            height: '200px',
            overflow: 'auto',
            border: '1px solid red',
          }"
        />

        <div style="height: 500px;">
          <Upload v-bind="simpleUploaderProps" id="test" component="div" :style="{ display: 'inline-block' }">
            <a>开始上传2</a>
          </Upload>
        </div>
        <button type="button" @click="destroy = true">
          destroy
        </button>
      </div>
    </Variant>
  </Story>
</template>
