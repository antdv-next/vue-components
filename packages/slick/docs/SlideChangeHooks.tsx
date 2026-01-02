import { defineComponent, ref } from 'vue'
import Slider from '../src'
import { renderNumberSlides } from './shared'

export default defineComponent(() => {
  const oldSlide = ref(0)
  const activeSlide = ref(0)
  const activeSlide2 = ref(0)

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (current: number, next: number) => {
      oldSlide.value = current
      activeSlide.value = next
    },
    afterChange: (current: number) => {
      activeSlide2.value = current
    },
  }

  return () => (
    <div class="slider-container">
      <h2>beforeChange and afterChange hooks</h2>
      <p>
        BeforeChange =&gt; oldSlide:
        {' '}
        <strong>{oldSlide.value}</strong>
      </p>
      <p>
        BeforeChange =&gt; activeSlide:
        {' '}
        <strong>{activeSlide.value}</strong>
      </p>
      <p>
        AfterChange =&gt; activeSlide:
        {' '}
        <strong>{activeSlide2.value}</strong>
      </p>
      <Slider {...settings}>
        {renderNumberSlides(6)}
      </Slider>
    </div>
  )
})
