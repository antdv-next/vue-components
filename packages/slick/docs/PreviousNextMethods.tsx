import type { SlickRef } from '../src'
import { defineComponent, ref } from 'vue'
import Slider from '../src'
import { renderNumberSlides } from './shared'

export default defineComponent(() => {
  const sliderRef = ref<SlickRef | null>(null)

  const next = () => {
    sliderRef.value?.slickNext()
  }

  const previous = () => {
    sliderRef.value?.slickPrev()
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  }

  return () => (
    <div class="slider-container">
      <Slider ref={sliderRef} {...settings}>
        {renderNumberSlides(6)}
      </Slider>
      <div style={{ textAlign: 'center' }}>
        <button class="button" onClick={previous}>Previous</button>
        <button class="button" onClick={next}>Next</button>
      </div>
    </div>
  )
})
