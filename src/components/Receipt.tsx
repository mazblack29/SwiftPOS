import { SaleTransaction } from '../types'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ReceiptProps {
  transaction: SaleTransaction
  onClose: () => void
}

const Receipt = ({ transaction, onClose }: ReceiptProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    })
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Add the print content
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              font-size: 24px;
              margin: 0 0 5px 0;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .items {
              margin: 20px 0;
              border-top: 1px solid #eee;
              border-bottom: 1px solid #eee;
              padding: 10px 0;
            }
            .item {
              margin: 10px 0;
            }
            .item-header {
              display: grid;
              grid-template-columns: 5fr 2fr 2fr 3fr;
              font-weight: 500;
              font-size: 12px;
              color: #666;
              margin-bottom: 10px;
            }
            .item-row {
              display: grid;
              grid-template-columns: 5fr 2fr 2fr 3fr;
              font-size: 14px;
              margin: 5px 0;
            }
            .text-right {
              text-align: right;
            }
            .summary {
              margin-top: 20px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .total {
              font-weight: bold;
              font-size: 16px;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #eee;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 0;
              }
              @page {
                margin: 10mm;
                size: 80mm auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SwiftPOS</h1>
            <p>Transaction #${transaction.id}</p>
            <p>${formatDate(transaction.timestamp)}</p>
          </div>

          <div class="items">
            <div class="item-header">
              <div>Item</div>
              <div class="text-right">Price</div>
              <div class="text-right">Qty</div>
              <div class="text-right">Subtotal</div>
            </div>
            ${transaction.items.map((item) => {
              const quantity = item.quantity || 1
              const pricePerItem = item.price
              const subtotal = pricePerItem * quantity
              return `
                <div class="item-row">
                  <div>
                    <div>${item.name}</div>
                    <div style="font-size: 12px; color: #666;">${item.sku || ''}</div>
                  </div>
                  <div class="text-right">${formatPrice(pricePerItem)}</div>
                  <div class="text-right">${quantity}</div>
                  <div class="text-right">${formatPrice(subtotal)}</div>
                </div>
              `
            }).join('')}
          </div>

          <div class="summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${formatPrice(transaction.total)}</span>
            </div>
            <div class="summary-row">
              <span>Tax (11%)</span>
              <span>${formatPrice(transaction.total * 0.11)}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>${formatPrice(transaction.total * 1.11)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>Please come again</p>
          </div>
        </body>
      </html>
    `)

    // Print and close the window
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Sales Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="space-y-4">
          {/* Receipt Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">SwiftPOS</h1>
            <p className="text-gray-600">Transaction #{transaction.id}</p>
            <p className="text-gray-600">{formatDate(transaction.timestamp)}</p>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-sm font-medium text-gray-500 mb-2">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-3 text-right">Subtotal</div>
            </div>
            
            {transaction.items.map((item, index) => {
              const quantity = item.quantity || 1
              const pricePerItem = item.price
              const subtotal = pricePerItem * quantity

              return (
                <div key={index} className="grid grid-cols-12 text-sm border-b border-gray-100 py-2">
                  <div className="col-span-5">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-gray-500 text-xs">{item.sku}</div>
                  </div>
                  <div className="col-span-2 text-right text-gray-600">
                    {formatPrice(pricePerItem)}
                  </div>
                  <div className="col-span-2 text-right text-gray-600">
                    {quantity}
                  </div>
                  <div className="col-span-3 text-right font-medium text-gray-900">
                    {formatPrice(subtotal)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatPrice(transaction.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (11%)</span>
              <span className="text-gray-900">{formatPrice(transaction.total * 0.11)}</span>
            </div>
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(transaction.total * 1.11)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm pt-4 border-t">
            <p>Thank you for your purchase!</p>
            <p>Please come again</p>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  )
}

export default Receipt
