'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { MdMessage, MdAdd, MdSend, MdPerson } from 'react-icons/md'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type InspectionNote } from '@/features/requests/data/requests'

interface InspectionNotesProps {
  notes: InspectionNote[]
  onAddNote: (note: InspectionNote) => void
  disabled?: boolean
  currentUser: string
}

export function InspectionNotes({
  notes,
  onAddNote,
  disabled = false,
  currentUser,
}: InspectionNotesProps) {
  const [newNote, setNewNote] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note')
      return
    }

    setIsAdding(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const note: InspectionNote = {
      id: crypto.randomUUID(),
      note: newNote.trim(),
      addedBy: currentUser,
      addedAt: new Date(),
    }

    onAddNote(note)
    setNewNote('')
    setIsAdding(false)
    toast.success('Note added')
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Notes List */}
      <ScrollArea className='flex-1'>
        {notes.length > 0 ? (
          <div className='space-y-3 p-1'>
            {notes.map((note) => (
              <div
                key={note.id}
                className='rounded-lg border bg-muted/30 p-3'
              >
                <p className='text-sm'>{note.note}</p>
                <div className='flex items-center gap-2 mt-2 text-xs text-muted-foreground'>
                  <MdPerson className='h-3 w-3' />
                  <span>{note.addedBy}</span>
                  <span>•</span>
                  <span>{format(new Date(note.addedAt), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <MdMessage className='h-8 w-8 text-muted-foreground mb-2' />
            <p className='text-sm text-muted-foreground'>No notes yet</p>
          </div>
        )}
      </ScrollArea>

      {/* Add Note Input */}
      {!disabled && (
        <div className='border-t pt-3 mt-3'>
          <div className='flex gap-2'>
            <Textarea
              placeholder='Add an inspection note...'
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className='min-h-[60px] text-sm resize-none'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddNote()
                }
              }}
            />
          </div>
          <div className='flex justify-end mt-2'>
            <Button
              size='sm'
              onClick={handleAddNote}
              disabled={!newNote.trim() || isAdding}
            >
              <MdSend className='h-4 w-4 mr-1.5' />
              Add Note
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
