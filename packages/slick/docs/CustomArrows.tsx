import { defineComponent } from 'vue'
import Slider from '../src'
import { renderNumberSlides } from './shared'

const SampleNextArrow = defineComponent((_, { attrs }) => {
  return () => (
    <div
      {...attrs}
      style={{
        ...(attrs.style ? (attrs.style as any) : {}),
        display: 'block',
        background: 'red',
      }}
    />
  )
})

const SamplePrevArrow = defineComponent((_, { attrs }) => {
  return () => (
    <div
      {...attrs}
      style={{
        ...(attrs.style ? (attrs.style as any) : {}),
        display: 'block',
        background: 'green',
      }}
    />
  )
})

export default defineComponent(() => {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  }

  return () => (
    <div class="slider-container">
      <Slider {...settings}>
        {renderNumberSlides(6)}
      </Slider>
    </div>
  )
})
