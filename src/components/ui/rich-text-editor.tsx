'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdStrikethroughS,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdLooksOne,
  MdLooksTwo,
  MdLooks3,
  MdLink,
  MdImage,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdUndo,
  MdRedo,
  MdCode,
  MdRemove,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import { useCallback, useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

const MenuButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}) => (
  <Button
    type='button'
    variant='ghost'
    size='sm'
    onClick={onClick}
    disabled={disabled}
    className={cn('h-8 w-8 p-0', isActive && 'bg-muted')}
    title={title}
  >
    {children}
  </Button>
)

const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const addLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    if (!isValidUrl(url)) {
      alert('Please enter a valid URL starting with http:// or https://')
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Image URL')

    if (url) {
      if (!isValidUrl(url)) {
        alert('Please enter a valid image URL starting with http:// or https://')
        return
      }
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className='flex flex-wrap items-center gap-1 border-b p-2'>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        title='Bold'
      >
        <MdFormatBold className='h-4 w-4' />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        title='Italic'
      >
        <MdFormatItalic className='h-4 w-4' />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title='Underline'
      >
        <MdFormatUnderlined className='h-4 w-4' />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        title='Strikethrough'
      >
        <MdStrikethroughS className='h-4 w-4' />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        title='Code'
      >
        <MdCode className='h-4 w-4' />
      </MenuButton>

      <Separator orientation='vertical' className='mx-1 h-6' />

      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title='Heading 1'
      >
        <MdLooksOne className='h-4 w-4' />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title='Heading 2'
      >
        <MdLooksTwo className='h-4 w-4' />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title='Heading 3'
      >
        <MdLooks3 className='h-4 w-4' />
      </MenuButton>

      <Separator orientation='vertical' className='mx-1 h-6' />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title='Bullet List'
      >
        <MdFormatListBulleted className='h-4 w-4' />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title='Numbered List'
      >
        <MdFormatListNumbered className='h-4 w-4' />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title='Quote'
      >
        <MdFormatQuote className='h-4 w-4' />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title='Horizontal Rule'
      >
        <MdRemove className='h-4 w-4' />
      </MenuButton>

      <Separator orientation='vertical' className='mx-1 h-6' />

      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title='Align Left'
      >
        <MdFormatAlignLeft className='h-4 w-4' />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title='Align Center'
      >
        <MdFormatAlignCenter className='h-4 w-4' />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title='Align Right'
      >
        <MdFormatAlignRight className='h-4 w-4' />
      </MenuButton>

      <Separator orientation='vertical' className='mx-1 h-6' />

      <MenuButton onClick={addLink} isActive={editor.isActive('link')} title='Add Link'>
        <MdLink className='h-4 w-4' />
      </MenuButton>
      <MenuButton onClick={addImage} title='Add Image'>
        <MdImage className='h-4 w-4' />
      </MenuButton>

      <Separator orientation='vertical' className='mx-1 h-6' />

      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        title='Undo'
      >
        <MdUndo className='h-4 w-4' />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        title='Redo'
      >
        <MdRedo className='h-4 w-4' />
      </MenuButton>
    </div>
  )
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none dark:prose-invert',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className={cn('rounded-md border', className)}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
