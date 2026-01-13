"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import {
    Bold, Italic, List, ListOrdered, Image as ImageIcon,
    Heading1, Heading2, Quote, Undo, Redo
} from 'lucide-react'
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { useState } from 'react'

interface TiptapEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function TiptapEditor({ value, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    const [imageUrl, setImageUrl] = useState('')

    if (!editor) {
        return null
    }

    const addImage = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run()
            setImageUrl('')
        }
    }

    return (
        <div className="border rounded-md shadow-sm bg-white">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50/50">

                <div className="flex items-center gap-1">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('bold')}
                        onPressedChange={() => editor.chain().focus().toggleBold().run()}
                    >
                        <Bold className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('italic')}
                        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <Italic className="h-4 w-4" />
                    </Toggle>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <div className="flex items-center gap-1">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('heading', { level: 1 })}
                        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                        <Heading1 className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('heading', { level: 2 })}
                        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                        <Heading2 className="h-4 w-4" />
                    </Toggle>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <div className="flex items-center gap-1">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('bulletList')}
                        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <List className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('orderedList')}
                        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('blockquote')}
                        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        <Quote className="h-4 w-4" />
                    </Toggle>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://exemplo.com/imagem.png"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                            <Button onClick={addImage}>Adicionar</Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <div className="ml-auto flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                        <Undo className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                        <Redo className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>

            </div>
            <EditorContent editor={editor} className="p-4" />
        </div>
    )
}
