import { Inter } from 'next/font/google'
import LayoutGlobal from '@/components/Layout/LayoutGlobal'
import { Container } from '@/components/utils/Container'
import Pricing from '@/components/Sections/Pricing'
import Hero from '@/components/Sections/Hero'
import Testimonials from '@/components/Sections/Testimonials'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <LayoutGlobal home={true}>
      <Container>
        <Hero />
        <Testimonials />
        <Pricing />
      </Container>
    </LayoutGlobal>
  )
}
