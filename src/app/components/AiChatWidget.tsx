import { Fragment, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, RotateCcw, Send, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI } from '../services/api';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Negrito estilo markdown (**texto**) -> <strong>. O backend responde em markdown,
// mas trazer uma lib de markdown inteira só pra isso seria demais pro widget de chat.
function renderInline(content: string) {
  return content.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export function AiChatWidget() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  // Sem sessão logada não há como autenticar em /ia/ (exige Bearer no backend). Também
  // evita o flash do botão antes do AuthProvider terminar de checar o token salvo.
  if (isLoading || !isAuthenticated) return null;

  const handleNewConversation = () => {
    setSessionId(null);
    setMessages([]);
    setInput('');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const pergunta = input.trim();
    if (!pergunta || isSending) return;

    setInput('');
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: pergunta }]);
    setIsSending(true);

    try {
      // Cria a sessão só na primeira mensagem, pra não acumular sessões vazias
      // toda vez que o usuário só abre e fecha o widget.
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const session = await aiAPI.createSession();
        currentSessionId = session.id;
        setSessionId(session.id);
      }

      const response = await aiAPI.ask(currentSessionId, pergunta);
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: response.reply }]);
    } catch (error: any) {
      const message = error?.message || 'Erro ao falar com o assistente';
      toast.error(message);
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', content: `Desculpe, não consegui responder agora (${message}).` },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 z-50 h-14 w-14 rounded-full p-0 shadow-lg"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        aria-label="Abrir assistente de compras"
      >
        <Bot className="h-6 w-6" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
          <SheetHeader className="flex-row items-center justify-between border-b px-4 py-3 space-y-0">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Assistente de Compras
            </SheetTitle>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewConversation}
                disabled={isSending}
                className="mr-6"
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                Nova conversa
              </Button>
            )}
          </SheetHeader>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                <Bot className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                Pergunte sobre produtos, preços, categorias ou entregas.
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {renderInline(message.content)}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Pensando...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua pergunta..."
              disabled={isSending}
              className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button
              type="submit"
              size="icon"
              className="flex-shrink-0 rounded-full"
              disabled={isSending || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
