import { ChevronDown, List, Trash2 } from 'lucide-react'
import React from 'react'

const EditElement = ({ 
  isEdit, 
  handleEdit, 
  isOpen, 
  setIsOpen, 
  children,
  selectText
}) => {
  return (
    <div><div
    className={`flex flex-col transition-all duration-300 ${
      isOpen ? "opacity-100 min-h-20 py-4" : "opacity-0 h-0 invisible"
    }`}
  >
    <button
      onClick={() => handleEdit("remove")}
      className={`flex items-center gap-1 mt-3 font-medium cursor-pointer select-none ${
        isEdit.remove && isOpen
          ? "text-red-500 hover:text-red-600"
          : "text-neutral-600 hover:text-neutral-500"
      }`}
    >
      <Trash2 size={18} /> Delete Option
    </button>
    <button
      onClick={() => handleEdit("addToCorrect")}
      className={`flex items-center gap-1 mt-3 font-medium cursor-pointer select-none ${
        isEdit.addToCorrect && isOpen
          ? "text-green-500 hover:text-green-600"
          : "text-neutral-600 hover:text-neutral-500"
      }`}
    >
      <List size={18} /> {selectText}
    </button>
    {children}
  </div>
  <div
    className="flex items-center justify-center cursor-pointer mt-2 hover:bg-neutral-100"
    onClick={() => setIsOpen((prev) => !prev)}
  >
    <ChevronDown
      className={`font-medium transform ${
        isOpen
          ? "text-green-500 hover:text-green-400 rotate-180"
          : "text-neutral-600 hover:text-neutral-500"
      }`}
    />
  </div>
</div>
  )
}

export default EditElement