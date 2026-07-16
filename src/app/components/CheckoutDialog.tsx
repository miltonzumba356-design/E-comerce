import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { MapPin, Phone, Banknote, Loader2, Truck, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from './ShopContext';
import { ordersAPI, paymentsAPI, DeliveryCheckResponse } from '../services/api';
import { useCurrency } from '../hooks/useCurrency';
import cartaoImage from '../../assets/payments/cartao.png';
import transferenciaImage from '../../assets/payments/transferencia-bancaria.jpeg';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: string;
  onCheckoutComplete: () => void;
}

const PAYMENT_METHODS = [
  { value: 'cash_on_delivery', label: 'Pagamento na entrega', description: 'Pague em dinheiro ao receber', icon: Banknote, image: null },
  {
    value: 'bank_transfer',
    label: 'Transferência bancária',
    description: 'Multicaixa Express',
    icon: null,
    image: transferenciaImage,
  },
  { value: 'card', label: 'Cartão', description: 'Multicaixa', icon: null, image: cartaoImage },
];

interface DeliveryResult extends DeliveryCheckResponse {
  productName: string;
}

export function CheckoutDialog({ open, onOpenChange, total, onCheckoutComplete }: CheckoutDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart } = useShop();
  const { format } = useCurrency();
  const navigate = useNavigate();

  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [method, setMethod] = useState('cash_on_delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [postalCode, setPostalCode] = useState('');
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const [deliveryResults, setDeliveryResults] = useState<DeliveryResult[] | null>(null);

  useEffect(() => {
    if (open) {
      setPhone(user?.phone || '');
      setShippingAddress(user?.address || '');
      setStep('address');
      setDeliveryResults(null);
      setPostalCode('');
    }
  }, [open, user]);

  useEffect(() => {
    if (open && !isAuthenticated) {
      onOpenChange(false);
      toast.info('Entre na sua conta para finalizar a compra');
      navigate('/login');
    }
  }, [open, isAuthenticated, navigate, onOpenChange]);

  const handleCheckDelivery = async () => {
    if (!postalCode.trim()) {
      toast.error('Insira um código postal');
      return;
    }
    if (cart.length === 0) return;

    setIsCheckingDelivery(true);
    try {
      const results = await Promise.all(
        cart.map(async (line) => {
          const result = await ordersAPI.checkDelivery({
            product_id: line.product.id,
            postal_code: postalCode.trim(),
            quantity: line.quantity,
          });
          return { ...result, productName: line.product.name };
        })
      );
      setDeliveryResults(results);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao verificar entrega');
    } finally {
      setIsCheckingDelivery(false);
    }
  };

  const validateAddress = () => {
    if (phone.replace(/\D/g, '').length < 9) {
      toast.error('Por favor, insira um telefone válido');
      return false;
    }
    if (shippingAddress.trim().length < 5) {
      toast.error('Por favor, insira um endereço de entrega válido');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateAddress()) {
      setStep('payment');
    }
  };

  const handleFinishCheckout = async () => {
    setIsSubmitting(true);
    try {
      const order = await ordersAPI.create(shippingAddress.trim());
      await paymentsAPI.process(order.id, method);
      await clearCart();

      toast.success('Pedido realizado com sucesso!', {
        description: `Pedido #${order.id} — acompanhe em "Meus Pedidos"`,
        duration: 5000,
      });

      setStep('address');
      onCheckoutComplete();
      onOpenChange(false);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao finalizar o pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('address');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'address' ? 'Endereço de Entrega' : 'Forma de Pagamento'}
          </DialogTitle>
          <DialogDescription>
            {step === 'address'
              ? 'Confirme onde e como podemos te contactar para a entrega'
              : 'Escolha como deseja pagar o seu pedido'}
          </DialogDescription>
        </DialogHeader>

        {step === 'address' ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+244 923 456 789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Endereço de Entrega *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="shippingAddress"
                  placeholder="Rua, bairro, município, província..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="pl-10 min-h-[90px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Verificar disponibilidade de entrega (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  id="postalCode"
                  placeholder="Código postal, ex: 01001-SP"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={handleCheckDelivery} disabled={isCheckingDelivery}>
                  {isCheckingDelivery ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                </Button>
              </div>

              {deliveryResults && (
                <div className="space-y-2 pt-2">
                  {deliveryResults.map((result, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 text-sm p-2 rounded-md ${
                        result.available ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {result.available ? (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{result.productName}</p>
                        {result.available ? (
                          <p>
                            Entrega em {result.region || 'sua região'} — {result.estimated_days} dia(s)
                            {typeof result.shipping_cost === 'number' && ` — ${format(result.shipping_cost)}`}
                          </p>
                        ) : (
                          <p>{result.error || 'Entrega indisponível para este código postal'}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-secondary/40 border p-4 rounded-2xl flex justify-between items-center">
              <span className="text-muted-foreground">Total da compra</span>
              <span className="text-xl font-semibold">{total}</span>
            </div>

            <Button onClick={handleNextStep} className="w-full" size="lg">
              Continuar para Pagamento
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <RadioGroup value={method} onValueChange={setMethod} className="space-y-3">
              {PAYMENT_METHODS.map(({ value, label, description, icon: Icon, image }) => (
                <label
                  key={value}
                  htmlFor={value}
                  className={`flex items-center gap-4 border rounded-2xl p-4 cursor-pointer transition-colors ${
                    method === value ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'
                  }`}
                >
                  <RadioGroupItem value={value} id={value} />
                  <div className="h-11 w-11 shrink-0 rounded-xl border bg-white overflow-hidden flex items-center justify-center">
                    {image ? (
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      Icon && <Icon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>

            <div className="bg-secondary/40 border p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Telefone</span>
                <span className="font-medium">{phone}</span>
              </div>
              <div className="flex justify-between text-sm gap-4">
                <span className="text-muted-foreground shrink-0">Entrega</span>
                <span className="font-medium text-right">{shippingAddress}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-1">
                <span className="font-medium">Total</span>
                <span className="text-xl font-semibold">{total}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleFinishCheckout} className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-5 w-5 mr-2" />
                )}
                Finalizar Compra
              </Button>

              <Button
                variant="outline"
                onClick={() => setStep('address')}
                className="w-full"
                disabled={isSubmitting}
              >
                Voltar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
