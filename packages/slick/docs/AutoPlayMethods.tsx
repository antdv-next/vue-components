import type { SlickRef } from '../src'
import { defineComponent, ref } from 'vue'
import Slider from '../src'
import { renderNumberSlides } from './shared'

export default defineComponent(() => {
  const sliderRef = ref<SlickRef | null>(null)

  const play = () => {
    sliderRef.value?.slickPlay()
  }

  const pause = () => {
    sliderRef.value?.slickPause()
  }

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  }

  return () => (
    <div class="slider-container">
      <h2>Auto Play & Pause with buttons</h2>
      <Slider ref={sliderRef} {...settings}>
        {renderNumberSlides(6)}
      </Slider>
      <div style={{ textAlign: 'center' }}>
        <button class="button" onClick={play}>Play</button>
        <button class="button" onClick={pause}>Pause</button>
      </div>
    </div>
  )
})
