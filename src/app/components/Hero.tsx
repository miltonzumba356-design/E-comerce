import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import heroShop from '../../assets/hero-shop.jpg';
import heroDelivery from '../../assets/hero-delivery.jpg';

const slides = [heroShop, heroDelivery];
const SLIDE_DURATION = 5000;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const glassButtonClassName =
  'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors';

export function Hero() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Altura do header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden">
      {/* Fundo: carrossel alternando as imagens uma de cada vez */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[activeSlide]})` }}
          />
        </AnimatePresence>
      </div>
      {/* Overlay escuro para garantir contraste do texto branco sobre as imagens */}
      <div className="absolute inset-0 z-0 bg-black/60" />

      {/* Indicadores do carrossel */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            aria-label={`Mostrar imagem ${index + 1}`}
            onClick={() => setActiveSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === activeSlide ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto flex flex-col items-start justify-center px-6 md:px-12 max-w-4xl text-left text-white"
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Tudo o que você precisa, num só lugar
        </motion.h1>
        <motion.p variants={itemVariants} className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
          Moda, acessórios, casa, tecnologia e muito mais — uma loja completa para
          todos os gostos e ocasiões, com entrega rápida em Angola.
        </motion.p>
        <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-4">
          <Button onClick={() => scrollToSection('colecao')} size="lg" className={glassButtonClassName}>
            Explorar Produtos
          </Button>
          <Button onClick={() => navigate('/register')} size="lg" className={glassButtonClassName}>
            Criar Conta Grátis
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
