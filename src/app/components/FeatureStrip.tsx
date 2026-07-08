import { Truck, Wallet, Headphones } from 'lucide-react';

const FEATURES = [
  {
    icon: Truck,
    title: 'Envio Grátis',
    description: 'Frete grátis para pedidos acima de 50.000 Kz',
  },
  {
    icon: Wallet,
    title: 'Pagamento Flexível',
    description: 'Várias formas de pagamento seguras',
  },
  {
    icon: Headphones,
    title: 'Suporte 24x7',
    description: 'Atendimento todos os dias da semana',
  },
];

export function FeatureStrip() {
  return (
    <section className="border-t bg-gray-50 py-10">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <feature.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">{feature.title}</p>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
