import {
  MdArrowDownward,
  MdArrowForward,
  MdArrowUpward,
  MdRadioButtonUnchecked,
  MdCheckCircle,
  MdError,
  MdTimer,
  MdHelp,
  MdCancel,
} from 'react-icons/md'

export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
]

export const statuses = [
  {
    label: 'Backlog',
    value: 'backlog' as const,
    icon: MdHelp,
  },
  {
    label: 'Todo',
    value: 'todo' as const,
    icon: MdRadioButtonUnchecked,
  },
  {
    label: 'In Progress',
    value: 'in progress' as const,
    icon: MdTimer,
  },
  {
    label: 'Done',
    value: 'done' as const,
    icon: MdCheckCircle,
  },
  {
    label: 'Canceled',
    value: 'canceled' as const,
    icon: MdCancel,
  },
]

export const priorities = [
  {
    label: 'Low',
    value: 'low' as const,
    icon: MdArrowDownward,
  },
  {
    label: 'Medium',
    value: 'medium' as const,
    icon: MdArrowForward,
  },
  {
    label: 'High',
    value: 'high' as const,
    icon: MdArrowUpward,
  },
  {
    label: 'Critical',
    value: 'critical' as const,
    icon: MdError,
  },
]
