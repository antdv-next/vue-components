<script setup lang="ts">
import type { VNode } from 'vue'
import type { Step } from '../src'
import type { Status } from '../src/interface'
import { cloneVNode, h, ref, shallowRef } from 'vue'
import Steps from '../src'
import '../assets/index.less'
import '../assets/iconfont.less'

type VNodeChildAtom
  = | VNode
    | string
    | number
    | boolean
    | null
    | undefined
    | void
type VueNode = VNodeChildAtom | VNodeChildAtom[] | VNode

const description: string
  = '这里是多信息的描述啊这里是多信息的描述啊这里是多信息的描述啊这里是多信息的描述啊这里是多信息的描述啊'
const labelPlacement = 'vertical'

function getFinishIcon() {
  const path
    = 'M923 283.6c-13.4-31.1-32.6-58.9-56.9-82.8-24.3-23.8-52.'
      + '5-42.4-84-55.5-32.5-13.5-66.9-20.3-102.4-20.3-49.3 0-97.4 13.5-139'
      + '.2 39-10 6.1-19.5 12.8-28.5 20.1-9-7.3-18.5-14-28.5-20.1-41.8-25.5'
      + '-89.9-39-139.2-39-35.5 0-69.9 6.8-102.4 20.3-31.4 13-59.7 31.7-84 '
      + '55.5-24.4 23.9-43.5 51.7-56.9 82.8-13.9 32.3-21 66.6-21 101.9 0 33'
      + '.3 6.8 68 20.3 103.3 11.3 29.5 27.5 60.1 48.2 91 32.8 48.9 77.9 99'
      + '.9 133.9 151.6 92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.'
      + '7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3 56-51.7 10'
      + '1.1-102.7 133.9-151.6 20.7-30.9 37-61.5 48.2-91 13.5-35.3 20.3-70 '
      + '20.3-103.3 0.1-35.3-7-69.6-20.9-101.9z'
  return h(
    'svg',
    {
      width: '1em',
      height: '1em',
      full: 'currentColor',
      viewBox: '0 0 1024 1024',
      style: { verticalAlign: '-.125em' },
    },
    [h('path', { d: path })],
  )
}

function getErrorIcon() {
  const path1
    = 'M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229'
      + '.2 512-512S794.8 0 512 0zm311.1 823.1c-40.4 40.4-87.5 72.2-139.9 9'
      + '4.3C629 940.4 571.4 952 512 952s-117-11.6-171.2-34.5c-52.4-22.2-99'
      + '.4-53.9-139.9-94.3-40.4-40.4-72.2-87.5-94.3-139.9C83.6 629 72 571.'
      + '4 72 512s11.6-117 34.5-171.2c22.2-52.4 53.9-99.4 94.3-139.9 40.4-4'
      + '0.4 87.5-72.2 139.9-94.3C395 83.6 452.6 72 512 72s117 11.6 171.2 3'
      + '4.5c52.4 22.2 99.4 53.9 139.9 94.3 40.4 40.4 72.2 87.5 94.3 139.9C'
      + '940.4 395 952 452.6 952 512s-11.6 117-34.5 171.2c-22.2 52.4-53.9 9'
      + '9.5-94.4 139.9z'
  const path2
    = 'M640.3 765.5c-19.9 0-36-16.1-36-36 0-50.9-41.4-92.3-92'
      + '.3-92.3s-92.3 41.4-92.3 92.3c0 19.9-16.1 36-36 36s-36-16.1-36-36c0'
      + '-90.6 73.7-164.3 164.3-164.3s164.3 73.7 164.3 164.3c0 19.9-16.1 36'
      + '-36 36zM194.2 382.4a60 60 0 1 0 120 0 60 60 0 1 0-120 0zM709.5 382'
      + '.4a60 60 0 1 0 120 0 60 60 0 1 0-120 0z'

  return h(
    'svg',
    {
      width: '1em',
      height: '1em',
      full: 'currentColor',
      viewBox: '0 0 1024 1024',
      style: { verticalAlign: '-.125em' },
    },
    [h('path', { d: path1 }), h('path', { d: path2 })],
  )
}

const icons = {
  finish: getFinishIcon(),
  error: getErrorIcon(),
}

const customIconDescription = 'This is a description'

// ========== custom icon ============
function Icon({ type }: { type: string }) {
  return h('i', { class: `vcicon vcicon-${type}` })
}

// ========== dynamic =============
const dynamicItems = shallowRef([
  {
    title: '已完成',
    description:
      '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶',
  },
  {
    title: '进行中',
    description:
      '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶',
  },
  {
    title: '待运行',
    description:
      '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶',
  },
  {
    title: '待运行',
    description:
      '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶',
  },
])
function addStep() {
  dynamicItems.value.push({
    title: '待运行',
    description: '新的节点',
  })
  dynamicItems.value = [...dynamicItems.value]
}

// ============= inline ================
const inlineCurrent = ref(0)
function setInlineCurrent(value: number) {
  inlineCurrent.value = value
}
function inlineItemRender(
  item: InstanceType<typeof Step>['$props'],
  stepItem: VueNode,
) {
  return cloneVNode(stepItem as VNode, { title: item.description })
}

// ============ nav base ==============
const containerStyle = {
  border: '1px solid rgb(235, 237, 240)',
  marginBottom: 24,
}

const navCurrent = ref(0)
function setNavCurrent(newNav: number) {
  navCurrent.value = newNav
}

const navDescription = 'This is a description.'

// ============= nextSteps =============
function generateRandomSteps() {
  const n = Math.floor(Math.random() * 3) + 3
  const arr: Array<{ title: string }> = []
  for (let i = 0; i < n; i++) {
    arr.push({
      title: `步骤${i + 1}`,
    })
  }
  return arr
}
const steps = generateRandomSteps()
const nextStepCurrentStep = ref(Math.floor(Math.random() * steps.length))
function nextStep() {
  let s = nextStepCurrentStep.value + 1
  if (s === steps.length) {
    s = 0
  }
  nextStepCurrentStep.value = s
}
const stepsRefs = shallowRef<Array<any>>([])

// ========== simple ============
const simpleCurrent = ref(0)
function setSimpleCurrent(value: number) {
  console.log('Change:', value)
  simpleCurrent.value = value
}

// ========== step icon ==============
const stepIconCurrent = ref(0)
function setStepIconCurrent() {
  stepIconCurrent.value = (stepIconCurrent.value + 1) % 5
}
function stepIcon({ status, node }: { status: Status, node: any }) {
  const isProcessing = status === 'process'
  return isProcessing
    ? h('div', { style: { backgroundColor: 'blue' } }, [node])
    : node
}
</script>

<template>
  <Story title="Steps">
    <Variant title="alternativeLabel">
      <Steps
        :label-placement="labelPlacement"
        :current="1"
        :items="[
          {
            title: '已完成',
            description,
            status: 'wait',
          },
          {
            title: '进行中',
            description,
            status: 'wait',
            subTitle: '剩余 00:00:07',
          },
          undefined,
          {
            title: '待运行',
            description,
            status: 'process',
          },
          false,
          {
            title: '待运行',
            description,
            status: 'finish',
            disabled: true,
          },
          null,
        ]"
      />
    </Variant>

    <Variant title="composable">
      <Steps
        :current="1"
        :items="[
          {
            title: '已完成',
            description,
          },
          {
            title: '进行中',
            description,
          },
          {
            title: '进行中',
            description,
            style: { fontWeight: 'bold', fontStyle: 'italic' },
          },
          {
            title: '待运行',
            description,
          },
        ]"
      />
    </Variant>

    <Variant title="custom-svg-icon">
      <Steps
        :current="1"
        status="error"
        :icons="icons"
        :items="[
          { title: 'Finished', description: customIconDescription },
          { title: 'In Process', description: customIconDescription },
          { title: 'Waiting', description: customIconDescription },
        ]"
      />
    </Variant>

    <Variant title="customIcon">
      <Steps
        :current="1"
        :items="[
          { title: '步骤1', icon: Icon({ type: 'cloud' }) },
          { title: '步骤2', icon: 'apple' },
          { title: '步骤1', icon: 'github' },
        ]"
      />
    </Variant>

    <Variant title="dynamic">
      <button type="button" @click="addStep">
        Add new step
      </button>
      <Steps :items="dynamicItems" />
    </Variant>

    <Variant title="errorStep">
      <Steps
        :current="2"
        status="error"
        :items="[
          {
            title: '已完成',
            description,
          },
          {
            title: '进行中',
            description,
          },
          {
            title: '待运行',
            description,
          },
          {
            title: '待运行',
            description,
          },
        ]"
      />
    </Variant>

    <Variant title="inline">
      <button @click="setInlineCurrent(0)">
        Current: {{ inlineCurrent }}
      </button>

      <br>

      <Steps
        type="inline"
        :current="inlineCurrent"
        :items="[
          {
            title: '开发',
            description: '开发阶段：开发中',
          },
          {
            title: '测试',
            description: '测试阶段：测试中',
          },
          {
            title: '预发',
            description: '预发阶段：预发中',
          },
          {
            title: '发布',
            description: '发布阶段：发布中',
          },
        ]"
        :item-render="inlineItemRender"
        @change="setInlineCurrent"
      />
    </Variant>

    <Variant title="nav-base">
      <div>
        <Steps
          :style="containerStyle"
          type="navigation"
          :current="navCurrent"
          :items="[
            {
              title: 'Step 1',
              status: 'finish',
              subTitle: '剩余 00:00:05 超长隐藏',
              description: navDescription,
            },
            {
              title: 'Step 2',
              status: 'process',
              description: navDescription,
            },
            {
              title: 'Step 3',
              status: 'wait',
              description: navDescription,
              disabled: true,
            },
          ]"
          @change="setNavCurrent"
        />
        <Steps
          :style="containerStyle"
          type="navigation"
          :current="navCurrent"
          :items="[
            {
              title: 'Step 1',
              status: 'finish',
              subTitle: '剩余 00:00:05 超长隐藏',
            },
            {
              title: 'Step 2',
              status: 'process',
            },
            {
              title: 'Step 3',
              status: 'wait',
            },
            {
              title: 'Step 3',
              status: 'wait',
            },
          ]"
          @change="setNavCurrent"
        />
      </div>
    </Variant>

    <Variant title="nextStpe">
      <form className="my-step-form">
        <div>这个demo随机生成3~6个步骤，初始随机进行到其中一个步骤</div>
        <div>当前正在执行第{{ nextStepCurrentStep + 1 }}步</div>
        <div className="my-step-container">
          <Steps
            :current="nextStepCurrentStep"
            :items="
              steps.map((s, i) => ({
                ref: (c: VNode) => {
                  stepsRefs[i] = c;
                },
                key: i,
                title: s.title,
              }))
            "
          />
        </div>

        <div>
          <button type="button" @click="nextStep">
            下一步
          </button>
        </div>
      </form>
    </Variant>

    <Variant title="progressDot">
      <Steps
        progress-dot
        :current="1"
        size="small"
        :items="[
          {
            title: '已完成',
            description,
          },
          {
            title: '进行中',
            description,
          },
          {
            title: '待运行',
            description,
          },
          {
            title: '待运行',
            description,
          },
          {
            title: '待运行',
            description,
          },
        ]"
      />
    </Variant>

    <Variant title="simple">
      <div>
        <Steps
          :current="1"
          :items="[
            {
              title: '已完成',
            },
            {
              title: '进行中',
            },
            {
              title: '待运行',
            },
            {
              title: '待运行',
            },
          ]"
        />
        <Steps
          :current="1"
          :style="{ marginTop: 40 }"
          :items="[
            {
              title: '已完成',
              description,
            },
            {
              title: '进行中',
              subTitle: '剩余 00:00:07',
              description,
            },
            {
              title: '待运行',
              description,
            },
            {
              title: '待运行',
              description,
            },
          ]"
        />
        <Steps
          :current="1"
          status="error"
          :style="{ marginTop: 40 }"
          :items="[
            {
              title: '已完成',
              description,
            },
            {
              title: '进行中',
              subTitle: '剩余 00:00:07',
              description,
            },
            {
              title: '待运行',
              description,
            },
            {
              title: '待运行',
              description,
            },
          ]"
        />
        <Steps
          :current="simpleCurrent"
          :items="[
            { title: '已完成' },
            { title: '进行中' },
            { title: '待运行', description: 'Hello World!' },
            { title: '待运行' },
          ]"
          @change="setSimpleCurrent"
        />
      </div>
    </Variant>

    <Variant title="smallSize">
      <div>
        <Steps
          size="small"
          :current="1"
          :items="[
            {
              title: '已完成',
            },
            {
              title: '进行中',
            },
            {
              title: '待运行',
            },
            {
              title: '待运行',
            },
          ]"
        />
        <Steps
          size="small"
          :current="1"
          :style="{ marginTop: 40 }"
          :items="[
            {
              title: '步骤1',
            },
            {
              title: '步骤2',
              icon: Icon({ type: 'cloud' }),
            },
            {
              title: '步骤3',
              icon: 'apple',
            },
            {
              title: '待运行',
              icon: 'github',
            },
          ]"
        />
      </div>
    </Variant>

    <Variant title="stepIcon">
      <button type="button" @click="setStepIconCurrent">
        loop
      </button>
      <Steps
        :step-icon="stepIcon"
        :current="stepIconCurrent"
        :items="[
          {
            title: '已完成',
          },
          {
            title: '进行中',
          },
          {
            title: '待运行',
          },
          {
            title: '待运行',
          },
          {
            title: '待运行',
          },
        ]"
      />
    </Variant>

    <Variant title="vertical">
      <Steps
        direction="vertical"
        :items="[
          {
            title: '已完成',
            description,
          },
          {
            title: '进行中',
            description,
          },
          {
            title: '待运行',
            description,
          },
          {
            title: '待运行',
            description,
          },
        ]"
      />
    </Variant>
    <Variant title="verticalSmall">
      <Steps
        direction="vertical"
        size="small"
        :items="[
          {
            title: '已完成',
            description,
          },
          {
            title: '进行中',
            description,
          },
          {
            title: '待运行',
            description,
          },
          {
            title: '待运行',
            description,
          },
        ]"
      />
    </Variant>
  </Story>
</template>
