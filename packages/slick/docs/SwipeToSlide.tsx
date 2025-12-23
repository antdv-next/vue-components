import { defineComponent } from 'vue'
import Slider from '../src'
import { renderNumberSlides } from './shared'

export default defineComponent(() => {
  const settings = {
    className: 'center',
    infinite: true,
    centerPadding: '60px',
    slidesToShow: 5,
    swipeToSlide: true,
    afterChange: (index: number) => {
      console.log(`Slider Changed to: ${index + 1}, background: #222; color: #bada55`)
    },
  }

  return () => (
    <div class="slider-container">
      <Slider {...settings}>
        {renderNumberSlides(9)}
      </Slider>
    </div>
  )
})
