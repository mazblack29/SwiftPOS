import { useState, useEffect } from 'react'
import { X, Plus, Pencil, Trash2 } from 'lucide-react'
import { Product } from '../types'
import toast from 'react-hot-toast'

interface ProductManagerProps {
  onClose: () => void
}

const ProductManager = ({ onClose }: ProductManagerProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: ''
  })

  useEffect(() => {
    const storedProducts = localStorage.getItem('pos-products')
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts))
    }
  }, [])

  const saveProducts = (newProducts: Product[]) => {
    localStorage.setItem('pos-products', JSON.stringify(newProducts))
    setProducts(newProducts)
  }

  const handleAddProduct = () => {
    if (!formData.name || !formData.price || !formData.image) {
      toast.error('Please fill in all fields')
      return
    }

    const newProduct: Product = {
      id: Date.now(),
      name: formData.name,
      price: Number(formData.price),
      image: formData.image
    }

    saveProducts([...products, newProduct])
    setFormData({ name: '', price: '', image: '' })
    setShowAddForm(false)
    toast.success('Product added successfully')
  }

  const handleEditProduct = () => {
    if (!editingProduct || !formData.name || !formData.price || !formData.image) {
      toast.error('Please fill in all fields')
      return
    }

    const updatedProducts = products.map(p => 
      p.id === editingProduct.id 
        ? {
            ...p,
            name: formData.name,
            price: Number(formData.price),
            image: formData.image
          }
        : p
    )

    saveProducts(updatedProducts)
    setEditingProduct(null)
    setFormData({ name: '', price: '', image: '' })
    toast.success('Product updated successfully')
  }

  const handleDeleteProduct = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(p => p.id !== id)
      saveProducts(updatedProducts)
      toast.success('Product deleted successfully')
    }
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image
    })
    setShowAddForm(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingProduct) && (
          <div className="mb-6 bg-gray-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (IDR)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emoji Icon
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter emoji (e.g., 🍕)"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editingProduct ? handleEditProduct : handleAddProduct}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingProduct(null)
                    setFormData({ name: '', price: '', image: '' })
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product List */}
        <div className="mb-4">
          {!showAddForm && !editingProduct && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add New Product
            </button>
          )}

          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Icon</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-2xl">{product.image}</td>
                    <td className="px-4 py-3 text-gray-800">{product.name}</td>
                    <td className="px-4 py-3 text-gray-800">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductManager
