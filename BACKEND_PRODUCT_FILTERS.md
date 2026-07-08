# Backend: campos para filtros da Loja (Home redesenhada)

A Home (`/`) foi remodelada para uma página de loja com sidebar de filtros (categoria, tipo de
pele, preço, avaliação, promoções, disponibilidade), inspirada em `Beauty & Cosmetic E-commerce
Website UI_UX Design in Figma.jpeg`. O frontend já foi implementado assumindo os campos abaixo no
`Product` — hoje eles são **opcionais** em `src/app/services/api.ts` e a UI degrada graciosamente
(badge de desconto, estrelas etc. somem) quando ausentes. Este documento descreve o que falta no
backend Django REST para os dados aparecerem de verdade.

## 1. Novos campos no model `Product`

```python
class SkinType(models.TextChoices):
    NORMAL = "normal", "Normal"
    OILY = "oily", "Oleosa"
    DRY = "dry", "Seca"
    COMBINATION = "combination", "Mista"
    SENSITIVE = "sensitive", "Sensível"


class Product(models.Model):
    ...
    original_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Preço antes do desconto. Se maior que `price`, a loja mostra badge de % OFF.",
    )
    skin_type = models.CharField(max_length=20, choices=SkinType.choices, blank=True)
    is_best_seller = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    # rating/review_count: ver seção 2 — de preferência calculados, não armazenados diretamente.
```

`in_stock` **não precisa de campo novo**: já existe o app de inventário (`Stock`, com
`quantity`/`reserved`/`available`). Exponha um booleano calculado no serializer do produto:

```python
class ProductSerializer(serializers.ModelSerializer):
    in_stock = serializers.SerializerMethodField()

    def get_in_stock(self, obj):
        stock = getattr(obj, "stock", None)
        return stock is None or stock.available > 0  # sem registro de estoque = assume disponível
```

## 2. Avaliações (`rating` / `review_count`)

Precisa de um model novo, ex. `ProductReview` (usuário, produto, nota 1–5, comentário, data). O
`rating` e `review_count` do produto viram campos calculados (annotate no queryset da listagem para
não fazer N+1):

```python
Product.objects.annotate(
    rating=Avg("reviews__score"),
    review_count=Count("reviews"),
)
```

Se ainda não houver capacidade de construir o sistema de reviews agora, os campos podem ficar de
fora do serializer por enquanto — o frontend já trata a ausência deles (sem estrelas no card, sem
filtro de avaliação aplicável).

## 3. Migração e serializer

1. `python manage.py makemigrations products && migrate`.
2. Adicionar os campos novos ao `ProductSerializer` (leitura e escrita, exceto `in_stock`/`rating`/
   `review_count`, que são somente leitura/calculados).
3. Expor os mesmos campos no admin do produto (`ProductsManagement` do painel já tem os campos
   atuais — os novos precisam de UI equivalente lá também, fora do escopo deste documento).

## 4. Filtros no endpoint `GET /products/` (recomendado, não obrigatório)

Hoje o frontend carrega até 100 produtos (`productsAPI.getAll(1, 100)`) e filtra/ordena tudo no
cliente. Isso funciona bem para catálogos pequenos, mas não escala. Quando o catálogo crescer, adicionar
suporte a query params no `ProductViewSet` (via `django-filter` ou `filter_queryset` customizado):

| Query param | Tipo | Efeito |
|---|---|---|
| `category` | string (repetível) | filtra por slug de categoria |
| `skin_type` | string (repetível) | filtra por `skin_type` |
| `price_min`, `price_max` | decimal | filtra por faixa de `price` |
| `rating_min` | int (1–5) | filtra por `rating >= valor` |
| `is_best_seller`, `is_new_arrival`, `on_sale` | bool | filtros de promoção (`on_sale` = `original_price > price`) |
| `in_stock` | bool | filtra pelo campo calculado da seção 1 |
| `ordering` | string | `price`, `-price`, `-rating`, `-created_at` |
| `page`, `page_size` | int | paginação real (já suportado hoje) |

Quando esses filtros existirem no backend, a lógica de filtragem client-side em
`src/app/pages/HomePage.tsx` deve ser trocada por chamadas parametrizadas a `productsAPI.getAll`,
mantendo os mesmos componentes de UI (`ShopFilters`, `ShopToolbar`).
