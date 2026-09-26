
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import css from './SearchBox.module.css';

interface SearchBoxProps {
  onSearch: (query: string) => void;
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebounce(value, 300);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <input
      type="text"
      className={css.input}
      placeholder="Search notes..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}