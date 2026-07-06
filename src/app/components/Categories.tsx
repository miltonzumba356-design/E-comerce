import { useState, useEffect } from 'react';
import { useCatalog } from '../contexts/CatalogContext';
import { ProductGrid } from './ProductGrid';

const MAX_LABEL_CHARS = 10;

// Corta o rótulo da aba em no máximo 10 caracteres (com reticências) para não quebrar o layout mobile.
function truncateLabel(label: string) {
  if (label.length <= MAX_LABEL_CHARS) return label;
  return `${label.slice(0, MAX_LABEL_CHARS - 1)}…`;
}

export function Categories() {
  const { categories, products, getProductsByCategory, isLoading } = useCatalog();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  // Diferencia "Início" de "Produtos" quando ambos representam "sem filtro" (activeSlug null).
  const [activePseudoKey, setActivePseudoKey] = useState<'inicio' | 'produtos' | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && categories.length > 0) {
      setActiveSlug(categories[0].slug);
      setInitialized(true);
    }
  }, [categories, initialized]);

  const selectCategory = (slug: string) => {
    setActiveSlug(slug);
    setActivePseudoKey(null);
  };

  const selectPseudoTab = (key: 'inicio' | 'produtos') => {
    setActiveSlug(null);
    setActivePseudoKey(key);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white" id="colecao">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 bg-white" id="colecao">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          Nenhuma categoria cadastrada ainda.
        </div>
      </section>
    );
  }

  const activeProducts = activeSlug ? getProductsByCategory(activeSlug) : products;
  const hasOverflow = categories.length > 3;

  const tabClass = (isActive: boolean) =>
    `px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full transition-all whitespace-nowrap ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }`;

  return (
    <section className="py-8 bg-white" id="colecao">
      <div className="container mx-auto px-4">
        {/* Tabs de Navegação — geradas dinamicamente a partir das categorias reais */}

        {hasOverflow && (
          // Versão mobile: no máximo 4 abas (Início, 2 categorias, Produtos), rótulos de até 10 caracteres.
          <div className="flex md:hidden items-center justify-center gap-2 mb-8 flex-wrap">
            <button
              onClick={() => selectPseudoTab('inicio')}
              className={tabClass(activeSlug === null && activePseudoKey === 'inicio')}
            >
              Início
            </button>
            {categories.slice(0, 2).map((category) => (
              <button
                key={`mobile-${category.slug}`}
                onClick={() => selectCategory(category.slug)}
                title={category.name}
                className={tabClass(activeSlug === category.slug)}
              >
                {truncateLabel(category.name)}
              </button>
            ))}
            <button
              onClick={() => selectPseudoTab('produtos')}
              className={tabClass(activeSlug === null && activePseudoKey === 'produtos')}
            >
              Produtos
            </button>
          </div>
        )}

        {/* Versão completa: sempre presente no DOM (visível a partir de md, ou em telas menores quando não há overflow)
            para preservar a navegação por âncora do Header (#slug) mesmo quando a versão condensada está visível. */}
        <div
          className={`${hasOverflow ? 'hidden md:flex' : 'flex'} items-center justify-center gap-2 mb-8 overflow-x-auto pb-2`}
        >
          {categories.map((category) => (
            <button
              key={category.slug}
              id={category.slug}
              onClick={() => selectCategory(category.slug)}
              title={category.name}
              className={tabClass(activeSlug === category.slug)}
            >
              {truncateLabel(category.name)}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <ProductGrid
            products={activeProducts}
            emptyMessage="Nenhum produto cadastrado nesta categoria ainda."
          />
        </div>
      </div>
    </section>
  );
}
