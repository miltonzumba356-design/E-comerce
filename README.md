# INCLUSIVA - E-commerce de Moda Inclusiva para Angola 🇦🇴

![INCLUSIVA](src/imports/WhatsApp_Image_2026-07-04_at_16.25.21.jpeg)

## 🎯 Sobre o Projeto

**INCLUSIVA** é uma loja online moderna e completa de roupas e acessórios, com foco na diversidade e inclusão. O projeto foi desenvolvido especialmente para o mercado angolano, com moeda local (Kwanza - Kz), formato de telefone (+244) e localização em Português de Angola.

## ✨ Características Principais

### 🎨 Design Moderno
- Paleta de cores baseada no logotipo (Dourado #AE8B0D)
- Interface responsiva para desktop, tablet e mobile
- Animações suaves e experiência do usuário otimizada
- Componentes UI modernos com shadcn/ui

### 🛍️ Loja Completa
- **Homepage** com hero section e carrossel de ofertas
- **Catálogo de produtos** com filtros por categoria e gênero
- **Sistema de favoritos** para salvar produtos
- **Carrinho de compras** com atualização em tempo real
- **Busca inteligente** de produtos
- **Checkout completo** em 2 etapas

### 👥 Dois Painéis

#### Painel do Cliente (`/dashboard`)
- Histórico de pedidos
- Detalhes de cada pedido
- Gerenciamento de perfil
- Estatísticas pessoais

#### Painel Administrativo (`/admin`)
- Dashboard com estatísticas principais
- Gerenciamento completo de produtos
- Gerenciamento de pedidos e status
- Controle de inventário
- Relatórios de vendas

### 🔐 Sistema de Autenticação
- Login e registro de usuários
- Autenticação JWT (JSON Web Tokens)
- Dois níveis de acesso: Cliente e Admin
- Proteção de rotas sensíveis
- Renovação automática de tokens

### 🌍 Adaptado para Angola
- Moeda: **Kwanza Angolano (Kz)**
- Telefone: **Formato +244**
- Idioma: **Português de Angola**
- Formatação de números e datas localizadas

## 🚀 Tecnologias Utilizadas

- **React 18** - Framework JavaScript
- **TypeScript** - Tipagem estática
- **React Router** - Navegação e rotas
- **Tailwind CSS v4** - Estilização
- **shadcn/ui** - Componentes UI
- **Lucide React** - Ícones
- **Sonner** - Notificações toast
- **Vite** - Build tool

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- Backend da API rodando (ver `E-Commerce API.yaml` na raiz do projeto)

### Passos

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd inclusiva-ecommerce
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure a URL da API**
Copie `.env.example` para `.env` e defina a URL base do backend:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acesse a aplicação**
Abra [http://localhost:5173](http://localhost:5173) no seu navegador

### Testes

```bash
npm run test        # roda os testes de contrato (Vitest + MSW) uma vez
npm run test:watch  # modo watch
```

## 📖 Documentação

- **[IMPLEMENTACAO.md](IMPLEMENTACAO.md)** - Lista completa de funcionalidades implementadas
- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Guia para configurar e conectar ao backend
- **[E-Commerce API.yaml](E-Commerce%20API.yaml)** - Especificação OpenAPI completa da API (fonte da verdade)

## 🗺️ Estrutura de Rotas

```
/ - Homepage (loja pública)
/login - Tela de login
/register - Tela de registro  
/dashboard - Painel do cliente
/admin - Dashboard administrativo
/admin/products - Gerenciar produtos
/admin/orders - Gerenciar pedidos
/admin/customers - Gerenciar clientes
/admin/reports - Relatórios
```

## 💻 Scripts Disponíveis

```bash
pnpm dev        # Iniciar servidor de desenvolvimento
pnpm build      # Build para produção
pnpm preview    # Preview da build de produção
```

## 🔌 Integração com Backend

O frontend está totalmente integrado com uma API REST Django. Todos os endpoints estão implementados:

- ✅ Autenticação (login, registro, refresh token)
- ✅ Produtos (CRUD completo)
- ✅ Categorias
- ✅ Carrinho de compras
- ✅ Pedidos
- ✅ Pagamentos
- ✅ Inventário
- ✅ Relatórios
- ✅ Gestão de usuários

### Sem dados mockados
Todo o catálogo (produtos, categorias), carrinho e pedidos vêm diretamente da API — não há mais arrays de produtos hardcoded. A única exceção é a lista de **favoritos**, que fica em `localStorage` por não haver endpoint de wishlist na API.

## 🎨 Paleta de Cores

Baseada no logotipo da marca:

- **Primária**: `#AE8B0D` (Dourado)
- **Secundária**: `#F7EFD9` (Creme claro)
- **Accent**: `#AE8B0D` (Dourado)
- **Background**: `#FFFFFF` (Branco)

## 📱 Responsividade

O site é totalmente responsivo e se adapta a:
- 📱 Mobile (320px+)
- 📲 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🔒 Segurança

- Autenticação JWT com tokens de acesso e renovação
- Proteção de rotas administrativas
- Validação de formulários
- Headers de segurança configurados

## 🌟 Funcionalidades Destacadas

### Para Clientes
- ✅ Navegação intuitiva por categorias
- ✅ Filtros por gênero (Feminino, Masculino, Acessórios)
- ✅ Sistema de favoritos
- ✅ Carrinho persistente
- ✅ Checkout seguro
- ✅ Histórico de pedidos
- ✅ Acompanhamento de entregas

### Para Administradores
- ✅ Dashboard com métricas em tempo real
- ✅ Gestão completa de produtos
- ✅ Controle de estoque
- ✅ Gerenciamento de pedidos
- ✅ Atualização de status de pedidos
- ✅ Relatórios de vendas
- ✅ Gestão de clientes

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e comerciais.

## 📞 Suporte

Para dúvidas ou suporte:
- 📧 Email: suporte@inclusiva.ao
- 📱 WhatsApp: +244 xxx xxx xxx

## 🎯 Roadmap Futuro

- [ ] App mobile (React Native)
- [ ] Sistema de reviews e avaliações
- [ ] Chat de suporte ao vivo
- [ ] Programa de fidelidade
- [ ] Integração com gateways de pagamento angolanos
- [ ] Multi-idioma (Português, Inglês)
- [ ] Sistema de cupons e descontos
- [ ] Integração com redes sociais

---

Desenvolvido com ❤️ para Angola
