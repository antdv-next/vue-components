import { defineComponent, ref } from 'vue'
import Slider from '../src'
import { renderNumberSlides } from './shared'

export default defineComponent(() => {
  const display = ref(true)
  const width = ref(600)

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
  }

  return () => (
    <div class="slider-container">
      <h2>Resizable Collapsible</h2>
      <button class="button" onClick={() => { width.value += 100 }}>increase</button>
      <button class="button" onClick={() => { width.value -= 100 }}>decrease</button>
      <button class="button" onClick={() => { display.value = !display.value }}>toggle</button>
      <div
        style={{
          width: `${width.value}px`,
          display: display.value ? 'block' : 'none',
        }}
      >
        <Slider {...settings}>
          {renderNumberSlides(6)}
        </Slider>
      </div>
    </div>
  )
})
