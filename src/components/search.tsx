import { MdSearch } from 'react-icons/md'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-provider'
import { Button } from './ui/button'

type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({
  className = '',
  placeholder = 'Search',
}: SearchProps) {
  const { setOpen } = useSearch()
  return (
    <Button
      variant='outline'
      className={cn(
        'bg-muted/25 group text-muted-foreground hover:bg-accent relative h-9 w-full flex-1 justify-start text-sm font-normal shadow-none sm:w-40 sm:pe-12 md:flex-none lg:w-52 xl:w-64',
        className
      )}
      onClick={() => setOpen(true)}
    >
      <MdSearch
        aria-hidden='true'
        className='absolute start-3 top-1/2 -translate-y-1/2'
        size={18}
      />
      <span className='ms-6'>{placeholder}</span>
      <kbd className='bg-muted group-hover:bg-accent pointer-events-none absolute end-1.5 top-1/2 -translate-y-1/2 hidden h-5 items-center gap-1 rounded-full border px-2 font-mono text-[10px] font-medium opacity-100 select-none sm:flex'>
        <span className='text-xs'>⌘</span>K
      </kbd>
    </Button>
  )
}
