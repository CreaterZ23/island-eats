import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ShoppingCart, Flame, LogIn, LogOut } from 'lucide-react'
import { auth, googleProvider, db } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import CartDrawer from './components/CartDrawer'
import FoodGrid from './components/FoodGrid'
import './App.css'

function App() {
  const cartItems = useSelector((state) => state.cart.items)
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  
  const [user, setUser] = useState(null)
  const [ordersCount, setOrdersCount] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const totalSlots = 20
  const slotsRemaining = totalSlots - ordersCount
  const percentage = (ordersCount / totalSlots) * 100
  const isSoldOut = ordersCount >= totalSlots

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  // Listen to ordersCount in real-time
  useEffect(() => {
    const metadataRef = doc(db, 'metadata', 'sunday-drop')
    const unsubscribe = onSnapshot(metadataRef, (docSnap) => {
      if (docSnap.exists()) {
        setOrdersCount(docSnap.data().ordersCount || 0)
      } else {
        setOrdersCount(0)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Login error:', error)
      alert('Failed to login. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏝️</span>
            <h1 className="text-2xl font-bold text-orange-600">Island Eats</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <img 
                  src={user.photoURL} 
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-700 hidden md:block">{user.displayName}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden md:inline">Login with Google</span>
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingCart className="w-6 h-6 text-orange-600" />
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Sunday Special Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="w-6 h-6" />
            <h2 className="text-3xl font-bold">Sunday Special</h2>
            <Flame className="w-6 h-6" />
          </div>
          <p className="text-lg">Only 20 orders available today!</p>
        </div>
      </div>

      {/* Slots Remaining Progress Bar */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">Slots Remaining</span>
            <span className="font-bold text-orange-600">{slotsRemaining}/{totalSlots}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {isSoldOut ? (
              <span className="text-red-600 font-bold">SOLD OUT! 🔥</span>
            ) : (
              <span>{slotsRemaining} spots left - Order now!</span>
            )}
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <FoodGrid ordersCount={ordersCount} totalSlots={totalSlots} />

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        ordersCount={ordersCount}
        totalSlots={totalSlots}
      />
    </div>
  )
}

export default App
