import { defineComponent, ref } from 'vue'
import Steps from '../src'
import { createIconRender } from './icon-render'
import './nextStep.css'

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

export default defineComponent(() => {
  const currentStep = ref(Math.floor(Math.random() * steps.length))

  const nextStep = () => {
    let s = currentStep.value + 1
    if (s === steps.length) {
      s = 0
    }
    currentStep.value = s
  }

  return () => (
    <form class="my-step-form">
      <div>这个demo随机生成3~6个步骤，初始随机进行到其中一个步骤</div>
      <div>
        当前正在执行第
        {currentStep.value + 1}
        步
      </div>
      <div class="my-step-container">
        <Steps
          current={currentStep.value}
          iconRender={createIconRender()}
          items={steps.map(s => ({ title: s.title })) as any}
        />
      </div>

      <div>
        <button type="button" onClick={nextStep}>
          下一步
        </button>
      </div>
    </form>
  )
})
