import { defineComponent } from 'vue'
import Slider from '../src'
import { renderNumberSlides } from './shared'

export default defineComponent(() => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  }

  return () => (
    <div class="slider-container">
      <Slider {...settings}>
        {renderNumberSlides(6)}
      </Slider>
    </div>
  )
})
