import { defineComponent, ref } from 'vue'
import Slider from '../src'

export default defineComponent(() => {
  const slides = ref([1, 2, 3, 4, 5, 6])

  const handleClick = () => {
    slides.value = slides.value.length === 6
      ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
      : [1, 2, 3, 4, 5, 6]
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
  }

  return () => (
    <div class="slider-container">
      <button class="button" onClick={handleClick}>
        Click to change slide count
      </button>
      <Slider {...settings}>
        {slides.value.map(slide => (
          <div key={slide}>
            <h3>{slide}</h3>
          </div>
        ))}
      </Slider>
    </div>
  )
})
