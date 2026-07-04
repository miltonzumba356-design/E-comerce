import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { MapPin, Phone, Banknote, Landmark, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from './ShopContext';
import { ordersAPI, paymentsAPI } from '../services/api';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: string;
  onCheckoutComplete: () => void;
}

const PAYMENT_METHODS = [
  { value: 'cash_on_delivery', label: 'Pagamento na entrega', icon: Banknote },
  { value: 'bank_transfer', label: 'Transferência bancária', icon: Landmark },
  { value: 'card', label: 'Cartão', icon: CreditCard },
];

export function CheckoutDialog({ open, onOpenChange, total, onCheckoutComplete }: CheckoutDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const { clearCart } = useShop();
  const navigate = useNavigate();

  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [method, setMethod] = useState('cash_on_delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPhone(user?.phone || '');
      setShippingAddress(user?.address || '');
      setStep('address');
    }
  }, [open, user]);

  useEffect(() => {
    if (open && !isAuthenticated) {
      onOpenChange(false);
      toast.info('Entre na sua conta para finalizar a compra');
      navigate('/login');
    }
  }, [open, isAuthenticated, navigate, onOpenChange]);

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

            <Separator />

            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="text-sm text-gray-600">Total da compra:</p>
                <p className="text-2xl">{total}</p>
              </div>
            </div>

            <Button onClick={handleNextStep} className="w-full" size="lg">
              Continuar para Pagamento
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <RadioGroup value={method} onValueChange={setMethod} className="space-y-3">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  htmlFor={value}
                  className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                    method === value ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  <RadioGroupItem value={value} id={value} />
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span>{label}</span>
                </label>
              ))}
            </RadioGroup>

            <Separator />

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Telefone:</span>
                <span>{phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Entrega:</span>
                <span className="text-right max-w-[60%]">{shippingAddress}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span>Total:</span>
                <span className="text-xl">{total}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleFinishCheckout}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
                disabled={isSubmitting}
              >
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
