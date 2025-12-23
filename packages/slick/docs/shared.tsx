// @ts-expect-error this img
import abstract01 from './img/react-slick/abstract01.jpg'
// @ts-expect-error this img
import abstract02 from './img/react-slick/abstract02.jpg'
// @ts-expect-error this img
import abstract03 from './img/react-slick/abstract03.jpg'
// @ts-expect-error this img
import abstract04 from './img/react-slick/abstract04.jpg'

export const baseUrl = '/img/react-slick'
export const imageUrls = [
  abstract01,
  abstract02,
  abstract03,
  abstract04,
]

export function renderNumberSlides(count: number, start = 1) {
  return Array.from({ length: count }, (_, index) => {
    const value = start + index
    return (
      <div key={value}>
        <h3>{value}</h3>
      </div>
    )
  })
}

export function renderImageSlides(urls: string[]) {
  return urls.map((url, index) => (
    <div key={`${url}-${index}`}>
      <img src={url} />
    </div>
  ))
}
