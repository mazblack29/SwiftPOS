import { Settings } from 'lucide-react'
import { useState } from 'react'
import ProductManager from './ProductManager'

const Header = () => {
  const [showProductManager, setShowProductManager] = useState(false)

  return (
    <>
      <header className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Modern POS
          </h1>
          <p className="text-gray-600">
            Quick and easy checkout
          </p>
        </div>
        <button
          onClick={() => setShowProductManager(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors"
        >
          <Settings size={20} />
          Manage Products
        </button>
      </header>

      {showProductManager && (
        <ProductManager onClose={() => setShowProductManager(false)} />
      )}
    </>
  )
}

export default Header
