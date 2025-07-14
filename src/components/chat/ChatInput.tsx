'use client'

import { useState, useRef, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function ChatInput({ 
  onSendMessage, 
  placeholder = "Type a message...",
  disabled = false 
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <div className="border-t bg-white p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Attachment Button */}
        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Attach file"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextAreaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-2 pr-12 bg-gray-100 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ maxHeight: '120px' }}
          />
          
          {/* Emoji Button */}
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
            title="Add emoji"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Send/Voice Button */}
        {message.trim() ? (
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onMouseLeave={() => setIsRecording(false)}
            className={`p-2 rounded-full transition-colors ${
              isRecording ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
            }`}
            title="Hold to record"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
      </div>
      
      {isRecording && (
        <p className="text-center text-sm text-red-500 mt-2 animate-pulse">
          🎤 Recording... Release to send
        </p>
      )}
    </div>
  )
}