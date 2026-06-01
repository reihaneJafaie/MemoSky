import About from '../components/About'
import MakeQRSection from '../components/MakeQRSection'

export default function Home() {
  return (
    <main>
      <section className="sticky top-0 h-screen">
        <About />
      </section>

      <section className="sticky top-0 h-screen">
        <MakeQRSection />
      </section>
    </main>
  )
}