import { Product } from '../types'

interface ProductGridProps {
  products: Product[]
  onProductClick: (product: Product) => void
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onProductClick(product)}
          className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center gap-2 hover:bg-white/80"
        >
          <span className="text-4xl">{product.image}</span>
          <span className="font-medium text-gray-800">{product.name}</span>
          <span className="text-blue-600 font-bold">
            {formatPrice(product.price)}
          </span>
        </button>
      ))}
    </div>
  )
}

export default ProductGrid
