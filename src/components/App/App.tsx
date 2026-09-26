// src/components/App/App.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotes, createNote, deleteNote } from '../../services/noteService';
import type { CreateNotePayload } from '../../types/note';
import SearchBox from '../SearchBox/SearchBox';
import NoteList from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination';
import NoteForm from '../NoteForm/NoteForm';
import Modal from '../Modal/Modal';
import css from './App.module.css';

export default function App() {
  const [page, setPage] = useState<number>(1);
 // console.log('Рендер App.tsx, поточний page у стейті:', page);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const queryClient = useQueryClient();

  // Отримання нотаток (з урахуванням сторінки та пошуку)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notes', page, search],
    queryFn: () => fetchNotes({ page, perPage: 12, search }),
    placeholderData: (previousData) => previousData,
  });

  // Мутація для створення нотатки
  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsModalOpen(false);
    },
  });

  // Мутація для видалення нотатки
  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const handleSearch = (query: string) => {
    setSearch(query);
    //setPage(1); // Скидаємо на першу сторінку при пошуку
  };

  const handleCreateNote = (values: CreateNotePayload) => {
    createMutation.mutate(values);
  };

  const handleDeleteNote = (id: string) => {
    deleteMutation.mutate(id);
  };

 const handlePageChange = (selectedPage: number) => {
    // Жорстко перевіряємо, чи це реальна зміна і чи не виходимо ми за межі
    if (selectedPage === page) return;
    if (data && selectedPage > data.totalPages) return;
    
   // console.log('Зміна сторінки на:', selectedPage);
    setPage(selectedPage);
  };
  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onSearch={handleSearch} />
        
        {/* Пагінація в хедері між пошуком і кнопкою */}
        {data && (
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

        {data && <NoteList notes={data.notes} onDelete={handleDeleteNote} />}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NoteForm
          onSubmit={handleCreateNote}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}