import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Package2, BookText, Home, Menu, X } from 'lucide-react'
import { Product } from './types'
import Cart from './components/Cart'
import Inventory from './pages/Inventory'
import Journal from './pages/Journal'
import { Toaster } from 'react-hot-toast'
import ProductGrid from './components/ProductGrid'
import { HomeIcon, ClipboardDocumentListIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  )
}

function App() {
  const [cart, setCart] = useState<Product[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const storedProducts = localStorage.getItem('pos-products')
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts))
    } else {
      const defaultProducts: Product[] = [
        { id: 1, name: 'Coffee', price: 35000, image: '☕', stock: 100, sku: 'COF001' },
        { id: 2, name: 'Sandwich', price: 45000, image: '🥪', stock: 50, sku: 'SAN001' },
        { id: 3, name: 'Pizza', price: 89000, image: '🍕', stock: 30, sku: 'PIZ001' },
        { id: 4, name: 'Salad', price: 55000, image: '🥗', stock: 40, sku: 'SAL001' },
        { id: 5, name: 'Burger', price: 65000, image: '🍔', stock: 45, sku: 'BUR001' },
        { id: 6, name: 'Fries', price: 25000, image: '🍟', stock: 80, sku: 'FRI001' },
      ]
      localStorage.setItem('pos-products', JSON.stringify(defaultProducts))
      setProducts(defaultProducts)
    }
  }, [])

  const addToCart = (product: Product) => {
    // Check if there's enough stock
    const currentQuantityInCart = cart.filter(item => item.id === product.id).length
    const productInStock = products.find(p => p.id === product.id)
    
    if (productInStock && (productInStock.stock || 0) > currentQuantityInCart) {
      setCart(prev => [...prev, product])
      setIsCartOpen(true)
    } else {
      toast.error('Not enough stock available')
    }
  }

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  const clearCart = () => {
    setCart([])
  }

  const updateStock = (items: Product[]) => {
    // Create a map of product quantities in the transaction
    const quantityMap = items.reduce((acc, item) => {
      acc[item.id] = (acc[item.id] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    // Update products with new stock levels
    const updatedProducts = products.map(product => {
      if (quantityMap[product.id]) {
        return {
          ...product,
          stock: (product.stock || 0) - quantityMap[product.id]
        }
      }
      return product
    })

    // Save to localStorage
    localStorage.setItem('pos-products', JSON.stringify(updatedProducts))
    setProducts(updatedProducts)
  }

  const updateCartItemQuantity = (productId: number, newQuantity: number) => {
    // Check if there's enough stock
    const productInStock = products.find(p => p.id === productId)
    if (!productInStock || (productInStock.stock || 0) < newQuantity) {
      toast.error('Not enough stock available')
      return
    }

    const uniqueItems = cart.filter((item, index) => 
      cart.findIndex(i => i.id === item.id) === index
    )

    const newCart: Product[] = []
    uniqueItems.forEach(item => {
      if (item.id === productId) {
        for (let i = 0; i < newQuantity; i++) {
          newCart.push(item)
        }
      } else {
        const currentQuantity = cart.filter(i => i.id === item.id).length
        for (let i = 0; i < currentQuantity; i++) {
          newCart.push(item)
        }
      }
    })
    
    setCart(newCart)
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Navigation */}
        <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo and Mobile Menu Button */}
              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                >
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
                <div className="flex-shrink-0 flex items-center ml-4 md:ml-0">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    SwiftPOS
                  </h1>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex md:items-center md:space-x-2">
                <NavLink to="/">
                  <HomeIcon className="w-5 h-5" />
                  <span>Home</span>
                </NavLink>
                <NavLink to="/inventory">
                  <ArchiveBoxIcon className="w-5 h-5" />
                  <span>Inventory</span>
                </NavLink>
                <NavLink to="/journal">
                  <ClipboardDocumentListIcon className="w-5 h-5" />
                  <span>Journal</span>
                </NavLink>
              </div>

              {/* Cart Button */}
              <div className="flex items-center">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-lg">
              <NavLink to="/">
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/inventory">
                <ArchiveBoxIcon className="w-5 h-5" />
                <span>Inventory</span>
              </NavLink>
              <NavLink to="/journal">
                <ClipboardDocumentListIcon className="w-5 h-5" />
                <span>Journal</span>
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
          <div className="flex gap-6">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={
                  <div>
                    <ProductGrid products={products} onProductClick={addToCart} />
                  </div>
                } />
                <Route
                  path="/inventory"
                  element={<Inventory onAddToCart={addToCart} />}
                />
                <Route path="/journal" element={<Journal />} />
              </Routes>
            </div>
            
            {/* Shopping Cart Sidebar */}
            {isCartOpen && (
              <div className="w-96">
                <Cart
                  cart={cart}
                  onRemove={removeFromCart}
                  onClear={clearCart}
                  onUpdateQuantity={updateCartItemQuantity}
                  onClose={() => setIsCartOpen(false)}
                  onUpdateStock={updateStock}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
