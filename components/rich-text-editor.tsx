"use client"

import { useRef, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  label?: string
  id?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  label,
  id,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isComposingRef = useRef(false)

  useEffect(() => {
    if (!editorRef.current) return

    const editor = editorRef.current

    // Set initial content
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || ""
    }

    // Handle input events
    const handleInput = () => {
      if (!isComposingRef.current) {
        onChange(editor.innerHTML)
      }
    }

    // Handle composition events (for IME input like Nepali)
    const handleCompositionStart = () => {
      isComposingRef.current = true
    }

    const handleCompositionEnd = () => {
      isComposingRef.current = false
      onChange(editor.innerHTML)
    }

    // Handle paste events to strip dangerous content
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      const text = e.clipboardData?.getData("text/plain") || ""
      document.execCommand("insertText", false, text)
    }

    editor.addEventListener("input", handleInput)
    editor.addEventListener("compositionstart", handleCompositionStart)
    editor.addEventListener("compositionend", handleCompositionEnd)
    editor.addEventListener("paste", handlePaste)

    return () => {
      editor.removeEventListener("input", handleInput)
      editor.removeEventListener("compositionstart", handleCompositionStart)
      editor.removeEventListener("compositionend", handleCompositionEnd)
      editor.removeEventListener("paste", handlePaste)
    }
  }, [onChange])

  // Update content when value prop changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value])

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#7752FE] focus-within:border-[#7752FE]">
        {/* Toolbar */}
        <div className="border-b bg-muted/50 p-2 flex items-center gap-1 flex-wrap">
          <button
            type="button"
            className="p-2 hover:bg-accent rounded"
            onClick={() => document.execCommand("bold", false)}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className="p-2 hover:bg-accent rounded"
            onClick={() => document.execCommand("italic", false)}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className="p-2 hover:bg-accent rounded"
            onClick={() => document.execCommand("underline", false)}
            title="Underline"
          >
            <u>U</u>
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            type="button"
            className="p-2 hover:bg-accent rounded"
            onClick={() => document.execCommand("formatBlock", false, "h2")}
            title="Heading"
          >
            H
          </button>
          <button
            type="button"
            className="p-2 hover:bg-accent rounded"
            onClick={() => document.execCommand("formatBlock", false, "p")}
            title="Paragraph"
          >
            P
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            type="button"
            className="p-2 hover:bg-accent rounded"
            onClick={() => document.execCommand("insertUnorderedList", false)}
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            className="p-2 hover:bg-accent rounded"
            onClick={() => document.execCommand("insertOrderedList", false)}
            title="Numbered List"
          >
            1.
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            type="button"
            className="p-2 hover:bg-accent rounded"
            onClick={() => document.execCommand("createLink", false, prompt("Enter URL:") || "")}
            title="Insert Link"
          >
            🔗
          </button>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          id={id}
          contentEditable
          className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none"
          style={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />

        <style jsx>{`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
        `}</style>
      </div>
      <p className="text-xs text-muted-foreground">
        Use the toolbar to format your text. Supports basic formatting and lists.
      </p>
    </div>
  )
}

