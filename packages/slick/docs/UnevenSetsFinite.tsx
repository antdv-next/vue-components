import { defineComponent } from 'vue'
import Slider from '../src'
import { renderNumberSlides } from './shared'

export default defineComponent(() => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToScroll: 4,
    slidesToShow: 4,
  }

  return () => (
    <div class="slider-container">
      <Slider {...settings}>
        {renderNumberSlides(6)}
      </Slider>
    </div>
  )
})
