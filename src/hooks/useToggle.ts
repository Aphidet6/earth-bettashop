import { useState } from 'react';

interface UseToggleReturn {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export function useToggle(initialValue: boolean = false): UseToggleReturn {
  const [isOpen, setIsOpen] = useState(initialValue);

  const toggle = () => setIsOpen(prev => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    toggle,
    open,
    close
  };
}