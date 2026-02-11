'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { useEffect } from 'react'

interface Props {
  content: string
  onChange: (html: string) => void
}

export default function TiptapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'התחל לכתוב...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap p-6 min-h-[400px] focus:outline-none',
        dir: 'rtl',
      },
    },
  })

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-800 bg-gray-900/50">
        {/* Undo/Redo */}
        <ToolbarBtn
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
          label="↩"
          disabled={!editor.can().undo()}
        />
        <ToolbarBtn
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
          label="↪"
          disabled={!editor.can().redo()}
        />
        <span className="w-px h-6 bg-gray-700 self-center mx-1" />
        <ToolbarBtn
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="B"
          className="font-bold"
        />
        <ToolbarBtn
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="I"
          className="italic"
        />
        <ToolbarBtn
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          label="U"
          className="underline"
        />
        <span className="w-px h-6 bg-gray-700 self-center mx-1" />
        <ToolbarBtn
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="H2"
        />
        <ToolbarBtn
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="H3"
        />
        <ToolbarBtn
          active={editor.isActive('heading', { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          label="H4"
        />
        <span className="w-px h-6 bg-gray-700 self-center mx-1" />
        <ToolbarBtn
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="•"
        />
        <ToolbarBtn
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="1."
        />
        <ToolbarBtn
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="❝"
        />
        <span className="w-px h-6 bg-gray-700 self-center mx-1" />
        <ToolbarBtn
          active={false}
          onClick={() => {
            const url = window.prompt('הזן כתובת URL:')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          label="🔗"
        />
        {editor.isActive('link') && (
          <ToolbarBtn
            active={false}
            onClick={() => editor.chain().focus().unsetLink().run()}
            label="✗🔗"
          />
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarBtn({
  active, onClick, label, className = '', disabled = false,
}: {
  active: boolean; onClick: () => void; label: string; className?: string; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-1 rounded text-sm transition-colors ${className} ${
        disabled ? 'text-gray-600 cursor-not-allowed' :
        active
          ? 'bg-[#C8FF00] text-black'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}
