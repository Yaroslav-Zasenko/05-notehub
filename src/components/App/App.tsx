// src/components/App/App.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { fetchNotes } from '../../services/noteService';
import SearchBox from '../SearchBox/SearchBox';
import NoteList from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination';
import NoteForm from '../NoteForm/NoteForm';
import Modal from '../Modal/Modal';
import css from './App.module.css';

export default function App() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  
  // Використовуємо хук use-debounce із затримкою 400мс
  const [debouncedSearch] = useDebounce(search, 400);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Отримання нотаток (використовуємо debouncedSearch та поточну сторінку)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notes', page, debouncedSearch],
    queryFn: () => fetchNotes({ page, perPage: 12, search: debouncedSearch }),
    placeholderData: (previousData) => previousData,
  });

  const handleSearch = (query: string) => {
    // Якщо текст пошуку не змінився — нічого не робимо (захист від зайвих викликів)
    if (query === search) return;

    setSearch(query);
    setPage(1); // Скидаємо сторінку на 1 лише при реальній зміні пошуку
  };

  const handlePageChange = (selectedPage: number) => {
    if (selectedPage === page) return;
    if (data && selectedPage > data.totalPages) return;
    setPage(selectedPage);
  };

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onSearch={handleSearch} />
        
        {/* Рендеримо пагінацію лише якщо загальна кількість сторінок більша за 1 */}
        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        )}

        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create Note
        </button>
      </header>

      <main>
        {isLoading && <p>Завантаження нотаток...</p>}
        {isError && <p>Помилка завантаження даних!</p>}

        {data && <NoteList notes={data.notes} />}
      </main>

      {/* Модальне вікно та форма створення */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NoteForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}