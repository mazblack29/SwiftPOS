import { useState, useEffect } from 'react'
import { SaleTransaction } from '../types'
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns'
import { FileText, ChevronDown, ChevronUp, Trash2, Search, Calendar, Filter } from 'lucide-react'
import { toast } from 'react-hot-toast'

const Journal = () => {
  const [transactions, setTransactions] = useState<SaleTransaction[]>([])
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [transactionType, setTransactionType] = useState<'all' | 'sales' | 'purchase' | 'refund' | 'void' | 'adjustment'>('all')

  const transactionTypes = [
    { value: 'all', label: 'All Types', color: 'gray' },
    { value: 'sales', label: 'Sales', color: 'green' },
    { value: 'purchase', label: 'Purchases', color: 'blue' },
    { value: 'refund', label: 'Refunds', color: 'yellow' },
    { value: 'void', label: 'Void', color: 'red' },
    { value: 'adjustment', label: 'Adjustments', color: 'purple' }
  ] as const

  useEffect(() => {
    const storedTransactions = localStorage.getItem('sales-journal')
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions))
    }
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm:ss')
  }

  const toggleTransaction = (transactionId: string) => {
    setExpandedTransactions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId)
      } else {
        newSet.add(transactionId)
      }
      return newSet
    })
  }

  const handleDelete = (transactionId: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== transactionId)
    setTransactions(updatedTransactions)
    localStorage.setItem('sales-journal', JSON.stringify(updatedTransactions))
    setExpandedTransactions(prev => {
      const newSet = new Set(prev)
      newSet.delete(transactionId)
      return newSet
    })
    setShowDeleteConfirm(null)
    toast.success('Transaction deleted successfully')
  }

  const handleDeleteAll = () => {
    setTransactions([])
    localStorage.setItem('sales-journal', '[]')
    setExpandedTransactions(new Set())
    setShowDeleteAllConfirm(false)
    toast.success('All transactions deleted successfully')
  }

  const resetFilters = () => {
    setStartDate('')
    setEndDate('')
    setSearchQuery('')
    setTransactionType('all')
  }

  // Filter transactions based on search criteria
  const filteredTransactions = transactions.filter(transaction => {
    // Date filter
    if (startDate && endDate) {
      const transactionDate = parseISO(transaction.timestamp)
      const start = startOfDay(parseISO(startDate))
      const end = endOfDay(parseISO(endDate))
      if (!isWithinInterval(transactionDate, { start, end })) {
        return false
      }
    }

    // Search query filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      const hasMatchingItem = transaction.items.some(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.sku?.toLowerCase().includes(searchLower)
      )
      const hasMatchingId = transaction.id.toLowerCase().includes(searchLower)
      if (!hasMatchingItem && !hasMatchingId) {
        return false
      }
    }

    // Transaction type filter
    if (transactionType !== 'all') {
      const typeMap = {
        'sales': 'SALE-',
        'purchase': 'PURCHASE-',
        'refund': 'REFUND-',
        'void': 'VOID-',
        'adjustment': 'ADJUST-'
      }
      const prefix = typeMap[transactionType]
      if (!transaction.id.startsWith(prefix)) {
        return false
      }
    }

    return true
  })

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.timestamp).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, SaleTransaction[]>)

  const getTransactionTypeColor = (transactionId: string) => {
    if (transactionId.startsWith('SALE-')) return 'text-green-600'
    if (transactionId.startsWith('PURCHASE-')) return 'text-blue-600'
    if (transactionId.startsWith('REFUND-')) return 'text-yellow-600'
    if (transactionId.startsWith('VOID-')) return 'text-red-600'
    if (transactionId.startsWith('ADJUST-')) return 'text-purple-600'
    return 'text-gray-600'
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Journal</h1>
            <p className="text-gray-600">View all sales transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete All
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by item or transaction ID..."
                  className="border rounded-lg pl-10 pr-3 py-2 w-full"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Type</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as typeof transactionType)}
                className="border rounded-lg px-3 py-2"
              >
                {transactionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Delete All Confirmation Dialog */}
        {showDeleteAllConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete All Transactions</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete all transactions? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {Object.entries(groupedTransactions)
        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        .map(([date, dateTransactions]) => (
          <div key={date} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              {format(new Date(date), 'dd MMMM yyyy')}
            </h2>
            <div className="space-y-4">
              {dateTransactions
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map(transaction => {
                  const isExpanded = expandedTransactions.has(transaction.id)
                  const totalItems = transaction.items.length
                  const subtotal = transaction.total
                  const tax = subtotal * 0.11
                  const total = subtotal + tax

                  return (
                    <div
                      key={transaction.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div
                          className="flex items-center space-x-4 flex-1 cursor-pointer"
                          onClick={() => toggleTransaction(transaction.id)}
                        >
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className={`w-6 h-6 ${getTransactionTypeColor(transaction.id)}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Transaction #{transaction.id}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(transaction.timestamp)} • {totalItems} items
                            </p>
                          </div>
                          <div className="flex-1 text-right">
                            <div className="font-medium text-gray-900">{formatPrice(total)}</div>
                            <div className="text-sm text-gray-500">
                              {totalItems} {totalItems === 1 ? 'item' : 'items'}
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        
                        {/* Delete Button */}
                        <div className="ml-4 flex items-center">
                          {showDeleteConfirm === transaction.id ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDelete(transaction.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowDeleteConfirm(transaction.id)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                          <div className="space-y-4">
                            {/* Items */}
                            <div className="space-y-2">
                              {transaction.items.reduce((acc, item) => {
                                const existingItem = acc.find(i => i.id === item.id)
                                if (existingItem) {
                                  existingItem.quantity++
                                  existingItem.subtotal += item.price
                                } else {
                                  acc.push({
                                    ...item,
                                    quantity: 1,
                                    subtotal: item.price
                                  })
                                }
                                return acc
                              }, [] as any[]).map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <div>
                                    <span className="font-medium text-gray-900">{item.name}</span>
                                    <span className="text-gray-500"> × {item.quantity}</span>
                                  </div>
                                  <div className="text-gray-900">{formatPrice(item.subtotal)}</div>
                                </div>
                              ))}
                            </div>

                            {/* Summary */}
                            <div className="border-t border-gray-200 pt-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900">{formatPrice(subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax (11%)</span>
                                <span className="text-gray-900">{formatPrice(tax)}</span>
                              </div>
                              <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))}

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-500">
            {transactions.length === 0
              ? "No transactions have been made yet."
              : "Try adjusting your search filters."}
          </p>
        </div>
      )}
    </div>
  )
}

export default Journal
