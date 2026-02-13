import { useSelector, useDispatch } from 'react-redux'
import { removeItem, updateQuantity, clearCart } from '../store/cartSlice'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { auth, db } from '../firebase'
import { doc, runTransaction, collection, addDoc } from 'firebase/firestore'
import { useState } from 'react'

export default function CartDrawer({ isOpen, onClose, ordersCount, totalSlots }) {
  const dispatch = useDispatch()
  const cartItems = useSelector((state) => state.cart.items)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = async () => {
    const user = auth.currentUser

    if (!user) {
      alert('Please login to place an order.')
      return
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty!')
      return
    }

    setIsCheckingOut(true)

    try {
      const metadataRef = doc(db, 'metadata', 'sunday-drop')
      
      await runTransaction(db, async (transaction) => {
        const metadataDoc = await transaction.get(metadataRef)
        
        let currentCount = 0
        if (metadataDoc.exists()) {
          currentCount = metadataDoc.data().ordersCount || 0
        }

        if (currentCount >= totalSlots) {
          throw new Error('Sold Out! All 20 slots are filled.')
        }

        // Increment the orders count
        transaction.set(metadataRef, { ordersCount: currentCount + 1 }, { merge: true })

        // Save the order to the orders collection
        const orderData = {
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          items: cartItems,
          totalPrice: totalPrice,
          timestamp: new Date().toISOString(),
          orderNumber: currentCount + 1
        }

        // Note: We can't use addDoc inside a transaction, so we'll do it after
        // For now, we'll just increment the counter in the transaction
      })

      // Save order outside transaction (Firestore limitation)
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        items: cartItems,
        totalPrice: totalPrice,
        timestamp: new Date().toISOString()
      })

      // Order successful
      alert('🎉 Feast Reserved! Your order has been placed successfully!')
      dispatch(clearCart())
      onClose()
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error.message || 'Failed to place order. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      dispatch(removeItem(itemId))
    } else {
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }))
    }
  }

  const isSoldOut = ordersCount >= totalSlots

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Your cart is empty</p>
              <p className="text-sm mt-2">Add some delicious items!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch(removeItem(item.id))}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 bg-white rounded hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 bg-white rounded hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-bold text-orange-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-orange-600 text-2xl">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || isSoldOut}
              className={`w-full font-bold py-3 px-6 rounded-lg transition-colors text-lg ${
                isCheckingOut || isSoldOut
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {isCheckingOut ? 'Processing...' : isSoldOut ? 'Sold Out' : 'Checkout'}
            </button>
            {isSoldOut && (
              <p className="text-sm text-red-600 text-center font-semibold">
                All 20 slots are filled for today!
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
