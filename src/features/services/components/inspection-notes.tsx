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
          <div className='space-y-3'>
            {notes.map((note, index) => (
              <div
                key={note.id}
                className='rounded-2xl bg-secondary/40 ring-1 ring-border/50 p-4'
              >
                <p className='text-sm leading-relaxed'>{note.note}</p>
                <div className='flex items-center gap-2 mt-3 text-xs text-muted-foreground'>
                  <div className='h-5 w-5 rounded-full bg-secondary flex items-center justify-center'>
                    <span className='text-[10px] font-medium'>{note.addedBy.charAt(0)}</span>
                  </div>
                  <span className='font-medium'>{note.addedBy}</span>
                  <span className='text-muted-foreground/50'>•</span>
                  <span className='tabular-nums'>{format(new Date(note.addedAt), 'MMM dd, HH:mm')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-secondary/30 ring-1 ring-border/50'>
            <div className='h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-4'>
              <MdMessage className='h-7 w-7 text-muted-foreground' />
            </div>
            <p className='text-sm font-medium text-muted-foreground'>No notes yet</p>
          </div>
        )}
      </ScrollArea>

      {/* Add Note Input */}
      {!disabled && (
        <div className='border-t border-border/50 pt-4 mt-4'>
          <div className='relative rounded-2xl ring-1 ring-border focus-within:ring-2 focus-within:ring-primary transition-shadow'>
            <Textarea
              placeholder='Add an inspection note...'
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className='min-h-[80px] text-sm resize-none border-0 rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddNote()
                }
              }}
            />
          </div>
          <div className='flex justify-end mt-3'>
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || isAdding}
              className='rounded-full px-5 shadow-sm'
            >
              <MdSend className='h-4 w-4 mr-2' />
              Add Note
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
