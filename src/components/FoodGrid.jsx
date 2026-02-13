import { useDispatch } from 'react-redux'
import { addItem } from '../store/cartSlice'

const menuItems = [
  { id: 1, name: '15 Wings', price: 20.00, emoji: '🍗' },
  { id: 2, name: 'Macaroni Pie', price: 12.50, emoji: '🧀' },
  { id: 3, name: 'Callaloo', price: 2.50, emoji: '🥬' },
  { id: 4, name: 'Juice', price: 7.50, emoji: '🧃' },
]

const comboItem = {
  id: 5,
  name: 'Sunday Feast Combo',
  price: 38.00,
  emoji: '🎉',
  description: 'All items included!'
}

export default function FoodGrid({ ordersCount, totalSlots }) {
  const dispatch = useDispatch()
  const isSoldOut = ordersCount >= totalSlots

  const handleAddToCart = (item) => {
    if (isSoldOut) {
      alert('Sorry, all slots are filled for today!')
      return
    }
    dispatch(addItem(item))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Menu</h3>
      
      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-3 text-center">{item.emoji}</div>
            <h4 className="text-lg font-bold text-gray-800 mb-2 text-center">{item.name}</h4>
            <p className="text-2xl font-bold text-orange-600 mb-4 text-center">
              ${item.price.toFixed(2)}
            </p>
            <button
              onClick={() => handleAddToCart(item)}
              disabled={isSoldOut}
              className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${
                isSoldOut
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {isSoldOut ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>

      {/* Combo Deal */}
      <div className="bg-gradient-to-br from-orange-400 to-red-400 rounded-lg shadow-2xl p-8 text-white">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-6xl">{comboItem.emoji}</span>
          <div>
            <h3 className="text-3xl font-bold">{comboItem.name}</h3>
            <p className="text-lg opacity-90">{comboItem.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-75 line-through">Regular: $42.50</p>
            <p className="text-4xl font-bold">${comboItem.price.toFixed(2)}</p>
            <p className="text-sm opacity-90">Save $4.50!</p>
          </div>
          <button
            onClick={() => handleAddToCart(comboItem)}
            disabled={isSoldOut}
            className={`font-bold py-3 px-8 rounded-lg transition-colors text-lg ${
              isSoldOut
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-orange-600 hover:bg-gray-100'
            }`}
          >
            {isSoldOut ? 'Sold Out' : 'Add Combo'}
          </button>
        </div>
      </div>
    </div>
  )
}
