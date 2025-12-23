import type { SlickRef } from '../src'
import { defineComponent, onMounted, ref } from 'vue'
import Slider from '../src'
import { renderNumberSlides } from './shared'

export default defineComponent(() => {
  const sliderRef1 = ref<SlickRef | null>(null)
  const sliderRef2 = ref<SlickRef | null>(null)
  const nav1 = ref<SlickRef | null>(null)
  const nav2 = ref<SlickRef | null>(null)

  onMounted(() => {
    nav1.value = sliderRef1.value
    nav2.value = sliderRef2.value
  })

  return () => (
    <div class="slider-container">
      <h2>Slider Syncing (AsNavFor)</h2>
      <h4>First Slider</h4>
      <Slider asNavFor={nav2.value} ref={sliderRef1}>
        {renderNumberSlides(6)}
      </Slider>
      <h4>Second Slider</h4>
      <Slider
        asNavFor={nav1.value}
        ref={sliderRef2}
        slidesToShow={3}
        swipeToSlide
        focusOnSelect
      >
        {renderNumberSlides(6)}
      </Slider>
    </div>
  )
})
