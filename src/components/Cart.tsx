import { useState } from 'react'
import { Product } from '../types'
import { X, Minus, Plus, Printer } from 'lucide-react'
import Receipt from './Receipt'
import { toast } from 'react-hot-toast'

interface CartProps {
  cart: Product[]
  onRemove: (index: number) => void
  onClear: () => void
  onUpdateQuantity: (productId: number, quantity: number) => void
  onClose: () => void
  onUpdateStock: (items: Product[]) => void
}

const Cart = ({ cart, onRemove, onClear, onUpdateQuantity, onClose, onUpdateStock }: CartProps) => {
  const [showReceipt, setShowReceipt] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState<Product[]>([])
  const [discount, setDiscount] = useState(0)
  const [ppn, setPpn] = useState(11)
  const [totalAmount, setTotalAmount] = useState(0)

  const handlePayment = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0)
    const discountAmount = (subtotal * discount) / 100
    const ppnAmount = ((subtotal - discountAmount) * ppn) / 100
    const total = subtotal - discountAmount + ppnAmount

    // Create transaction record
    const transaction = {
      id: `SALE-${Date.now()}`,
      timestamp: new Date().toISOString(),
      items: cart,
      total: total
    }

    // Save to journal
    const salesJournal = JSON.parse(localStorage.getItem('sales-journal') || '[]')
    salesJournal.push(transaction)
    localStorage.setItem('sales-journal', JSON.stringify(salesJournal))

    // Update stock levels
    onUpdateStock(cart)
    
    // Store the current cart items for the receipt
    setCurrentTransaction([...cart])
    
    // Show receipt
    setShowReceipt(true)
    
    // Clear the cart
    onClear()

    setTotalAmount(total);

    toast.success('Payment successful!')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Group cart items and count quantities
  const groupedItems = cart.reduce((acc, item) => {
    const existingItem = acc.find(i => i.id === item.id)
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1
    } else {
      acc.push({ ...item, quantity: 1 })
    }
    return acc
  }, [] as (Product & { quantity?: number })[])

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0)
  const discountAmount = (subtotal * discount) / 100
  const ppnAmount = ((subtotal - discountAmount) * ppn) / 100
  const total = subtotal - discountAmount + ppnAmount

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {groupedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Cart is empty</div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {groupedItems.map((item, index) => {
                const quantity = item.quantity || 1
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{item.image}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                        className="p-1 rounded-md hover:bg-gray-100"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const indices = cart
                            .map((cartItem, idx) => cartItem.id === item.id ? idx : -1)
                            .filter(idx => idx !== -1)
                          indices.forEach(idx => onRemove(idx))
                        }}
                        className="p-1 rounded-md hover:bg-gray-100 text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">PPN (%)</label>
              <input
                type="number"
                value={ppn}
                onChange={(e) => setPpn(Number(e.target.value))}
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="text-gray-900">{formatPrice(discountAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">PPN ({ppn}%)</span>
                <span className="text-gray-900">{formatPrice(ppnAmount)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={handlePayment}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Pay Now
              </button>
              <button
                onClick={onClear}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Clear Cart
              </button>
              {showReceipt && (
                <Receipt
                  transaction={{
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    items: currentTransaction,
                    total: totalAmount
                  }}
                  onClose={() => setShowReceipt(false)}
                >
                  <button
                    onClick={() => {
                      // Call the handlePrint function from the Receipt
                      handlePrint();
                    }}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                  >
                    <Printer className="w-4 h-4 mr-2" /> Print Receipt
                  </button>
                </Receipt>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default Cart
