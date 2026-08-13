import { createContext, useContext, useState, useEffect } from 'react'

const FontSizeContext = createContext(null)

const SIZES = [
  { label: '小', px: 12 },
  { label: '標準', px: 16 },
  { label: '大', px: 20 },
  { label: '特大', px: 24 },
  { label: '長輩', px: 32 },
]

export { SIZES }

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('global_font_size')
    return saved ? parseInt(saved) : 16
  })

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + 'px'
    localStorage.setItem('global_font_size', fontSize)
  }, [fontSize])

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export function useFontSize() {
  return useContext(FontSizeContext)
}
