import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { ProductShowcase } from '../components/ProductShowcase';
import { Newsletter } from '../components/Newsletter';
import { Footer } from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedProducts />
        <Newsletter />
        <ProductShowcase />
      </main>
      <Footer />
    </div>
  );
}