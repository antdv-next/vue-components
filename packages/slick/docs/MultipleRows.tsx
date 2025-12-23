import { defineComponent } from 'vue'
import Slider from '../src'
import { renderNumberSlides } from './shared'

export default defineComponent(() => {
  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: '60px',
    slidesToShow: 3,
    speed: 500,
    rows: 2,
    slidesPerRow: 2,
  }

  return () => (
    <div class="slider-container">
      <Slider {...settings}>
        {renderNumberSlides(16)}
      </Slider>
    </div>
  )
})
