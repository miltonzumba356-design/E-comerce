import React, { useEffect, useRef, useState } from 'react';
import { productsAPI, Product, categoriesAPI, Category } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { useCurrency } from '../../hooks/useCurrency';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, ImagePlus, X } from 'lucide-react';

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const emptyProductForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  is_active: true,
  brand: '',
  color: '',
  material: '',
  weight: '',
  dimensions: '',
  specifications: '',
};

const emptyCategoryForm = { name: '', slug: '', description: '' };

export default function ProductsManagement() {
  const { format } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // ---- Produtos ----
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // ---- Categorias ----
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data.results);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data.results);
    } catch (error) {
      console.error('Erro ao carregar categorias');
    }
  };

  // ===================== PRODUTOS =====================

  const resetImageState = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenProductDialog = (product?: Product) => {
    resetImageState();
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category_detail?.slug || product.category,
        is_active: product.is_active,
        brand: product.brand || '',
        color: product.color || '',
        material: product.material || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        specifications: product.specifications ? JSON.stringify(product.specifications, null, 2) : '',
      });
      setImagePreview(product.image || null);
    } else {
      setEditingProduct(null);
      setProductForm(emptyProductForm);
    }
    setIsProductDialogOpen(true);
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await productsAPI.update(product.slug, { is_active: !product.is_active });
      setProducts((prev) =>
        prev.map((p) => (p.slug === product.slug ? { ...p, is_active: !p.is_active } : p))
      );
      toast.success(product.is_active ? 'Produto desativado' : 'Produto ativado');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status do produto');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let specifications: Record<string, unknown> | undefined;
    if (productForm.specifications.trim()) {
      try {
        specifications = JSON.parse(productForm.specifications);
      } catch {
        toast.error('Especificações inválidas — use um JSON válido, ex: {"voltagem": "220V"}');
        return;
      }
    }

    const payload = { ...productForm, specifications };
    setIsSavingProduct(true);

    try {
      if (editingProduct) {
        // Edição completa: o formulário já fornece todos os campos editáveis, então
        // usamos PUT (substituição total) em vez de PATCH.
        await productsAPI.replace(editingProduct.slug, payload, imageFile);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await productsAPI.create(payload, imageFile);
        toast.success('Produto criado com sucesso!');
      }

      setIsProductDialogOpen(false);
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar produto');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (slug: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await productsAPI.delete(slug);
      toast.success('Produto excluído com sucesso!');
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir produto');
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===================== CATEGORIAS =====================

  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, slug: category.slug, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm(emptyCategoryForm);
    }
    setIsCategoryDialogOpen(true);
  };

  const handleCategoryNameChange = (name: string) => {
    setCategoryForm((prev) => ({
      ...prev,
      name,
      // só auto-gera o slug enquanto o usuário não editou manualmente (criação de categoria nova)
      slug: editingCategory ? prev.slug : slugify(name),
    }));
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCategory(true);

    try {
      if (editingCategory) {
        // O formulário sempre fornece nome, slug e descrição completos, então
        // usamos PUT (substituição total) em vez de PATCH.
        await categoriesAPI.replace(editingCategory.slug, categoryForm);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await categoriesAPI.create(categoryForm);
        toast.success('Categoria criada com sucesso!');
      }

      setIsCategoryDialogOpen(false);
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar categoria');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (slug: string) => {
    if (!confirm('Excluir esta categoria? Produtos associados podem ficar sem categoria.')) return;

    try {
      await categoriesAPI.delete(slug);
      toast.success('Categoria excluída com sucesso!');
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir categoria');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Catálogo</h2>
        <p className="text-muted-foreground">Gerencie produtos e categorias da loja</p>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        {/* ===================== ABA PRODUTOS ===================== */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenProductDialog()} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImagePlus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category_detail?.name}</TableCell>
                    <TableCell>{format(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.is_active}
                          onCheckedChange={() => handleToggleActive(product)}
                        />
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenProductDialog(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.slug)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ===================== ABA CATEGORIAS ===================== */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenCategoryDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenCategoryDialog(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.slug)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhuma categoria cadastrada ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ===================== DIALOG: PRODUTO ===================== */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Imagem do Produto</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 border">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Pré-visualização" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="product-image-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="h-4 w-4 mr-2" />
                      {imagePreview ? 'Trocar imagem' : 'Selecionar imagem'}
                    </Button>
                    {imagePreview && (
                      <Button type="button" variant="ghost" size="sm" onClick={resetImageState}>
                        <X className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (Kz)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={productForm.category}
                    onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categories.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Nenhuma categoria cadastrada — crie uma na aba "Categorias" primeiro.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    value={productForm.color}
                    onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso</Label>
                  <Input
                    id="weight"
                    placeholder="ex: 500g"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensões</Label>
                <Input
                  id="dimensions"
                  placeholder="ex: 30x20x10cm"
                  value={productForm.dimensions}
                  onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications">Especificações (JSON, opcional)</Label>
                <Textarea
                  id="specifications"
                  placeholder='{"voltagem": "220V", "garantia": "12 meses"}'
                  value={productForm.specifications}
                  onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingProduct}>
                {isSavingProduct ? 'Salvando...' : editingProduct ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===================== DIALOG: CATEGORIA ===================== */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Nome</Label>
                <Input
                  id="category-name"
                  value={categoryForm.name}
                  onChange={(e) => handleCategoryNameChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-slug">Slug</Label>
                <Input
                  id="category-slug"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: slugify(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Descrição</Label>
                <Textarea
                  id="category-description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingCategory}>
                {isSavingCategory ? 'Salvando...' : editingCategory ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
