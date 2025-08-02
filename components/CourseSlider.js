import { useRef, useEffect, useState } from 'react'
import GlassCourseCard from '../components/GlassCourseCard'
import styles from '../styles/CourseSlider.module.css'

const courses = [
  {
    title: 'КОД СТЫДА',
    description: 'Онлайн-курс из 12 занятий по системной проработке механизмов стыда',
    link: '/courses/kod-styda',
    video: '/video/ks.mp4'
  },
  {
    title: 'ИНКВИЗИЦИЯ БОГАТСТВА',
    description: 'Курс о власти, деньгах и родовых ограничениях через архетипы',
    link: '/courses/wealth-inquisition'
  },
  {
    title: 'ПРОФАЙЛИНГ И ТАРО ТОТА',
    description: 'Анализ архетипов и поведения через системную оптику и карты',
    link: '/courses/profiling-thoth'
  }
]

export default function CourseSlider() {
  const sliderRef = useRef()
  const [centerIndex, setCenterIndex] = useState(0)

  const scroll = (dir) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: dir * 300,
        behavior: 'smooth'
      })
    }
  }

  // ⛔️ блокируем вертикальный scroll колёсиком
  useEffect(() => {
    const container = sliderRef.current
    if (!container) return

    const preventScroll = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
      }
    }

    container.addEventListener('wheel', preventScroll, { passive: false })

    return () => container.removeEventListener('wheel', preventScroll)
  }, [])

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    let startX = 0
    let endX = 0

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX
    }

    const onTouchEnd = (e) => {
      endX = e.changedTouches[0].clientX
      const delta = startX - endX
      if (delta > 50) scroll(1)
      else if (delta < -50) scroll(-1)
    }

    slider.addEventListener('touchstart', onTouchStart)
    slider.addEventListener('touchend', onTouchEnd)

    return () => {
      slider.removeEventListener('touchstart', onTouchStart)
      slider.removeEventListener('touchend', onTouchEnd)
    }
  }, [])


  // 🎯 выделение центральной карточки
  useEffect(() => {
    const slider = sliderRef.current
    const updateFocus = () => {
      const children = slider.querySelectorAll('[data-index]')
      let closest = 0
      let minDiff = Infinity
      children.forEach((child, i) => {
        const rect = child.getBoundingClientRect()
        const diff = Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2)
        if (diff < minDiff) {
          closest = i
          minDiff = diff
        }
      })
      setCenterIndex(closest)
    }

    updateFocus()
    slider.addEventListener('scroll', updateFocus)
    return () => slider.removeEventListener('scroll', updateFocus)
  }, [])

  return (
    <div className={styles.wrapper}>
      <button className={styles.leftButton} onClick={() => scroll(-1)}>‹</button>
      <div className={styles.slider} ref={sliderRef}>
        {courses.map((course, index) => (
          <div
            key={index}
            data-index={index}
            className={`${styles.card} ${index === centerIndex ? styles.focused : ''}`}
          >
            <GlassCourseCard {...course} isFocused={index === centerIndex} />
          </div>
        ))}
      </div>
      <button className={styles.rightButton} onClick={() => scroll(1)}>›</button>
    </div>
  )
}
