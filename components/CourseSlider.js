// components/CourseSlider.js
import GlassCourseCard from '../components/GlassCourseCard'
import styles from '../styles/CourseSlider.module.css'

const courses = [
  {
    title: 'КОД СТЫДА',
    description: 'Онлайн-курс из 12 занятий по системной проработке механизмов стыда',
    link: '/courses/kod-styda'
  },
  {
    title: 'ИНКВИЗИЦИЯ БОГАТСТВА',
    description: 'Курс о власти, деньгах и родовых ограничениях через архетипы',
    link: '/courses/wealth-inquisition'
  },
  {
    title: 'АРХЕТИПИЧЕСКИЙ ПРОФАЙЛИНГ',
    description: 'Методика чтения поведения и выбора через карты и психотипы',
    link: '/courses/profiling'
  }
]

export default function CourseSlider() {
  return (
    <div className={styles.sliderContainer}>
      <div className={styles.slider}>
        {courses.map((course, idx) => (
          <GlassCourseCard key={idx} {...course} />
        ))}
      </div>
    </div>
  )
}
