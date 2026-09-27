// src/components/NoteForm/NoteForm.tsx
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote } from '../../services/noteService';
import type { NoteTag } from '../../types/note';
import css from './NoteForm.module.css';

interface NoteFormValues {
  title: string;
  content: string;
  tag: NoteTag;
}

interface NoteFormProps {
  onClose: () => void;
}

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(50, 'Title must be at most 50 characters')
    .required('Title is required'),
  content: Yup.string()
    .max(500, 'Content must be at most 500 characters'), // Поле більше не обов'язкове
  tag: Yup.string()
    .oneOf(['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as NoteTag[])
    .required('Tag is required'),
});

const initialValues: NoteFormValues = {
  title: '',
  content: '',
  tag: 'Todo',
};

export default function NoteForm({ onClose }: NoteFormProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      // Інвалідуємо запит нотаток, щоб список автоматично оновився
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      // Закриваємо форму/модалку після успішного створення
      onClose();
    },
  });

  const handleSubmit = (values: NoteFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className={css.form}>
        <h2 className={css.title}>Create New Note</h2>

        <div className={css.formGroup}>
          <label htmlFor="title" className={css.label}>Title</label>
          <Field 
            id="title" 
            name="title" 
            type="text" 
            className={css.input} 
            placeholder="Enter title" 
          />
          <ErrorMessage name="title" component="div" className={css.error} />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="content" className={css.label}>Content</label>
          <Field
            as="textarea"
            id="content"
            name="content"
            className={css.textarea}
            placeholder="Enter content"
          />
          <ErrorMessage name="content" component="div" className={css.error} />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="tag" className={css.label}>Tag</label>
          <Field as="select" id="tag" name="tag" className={css.select}>
            <option value="Todo">Todo</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Meeting">Meeting</option>
            <option value="Shopping">Shopping</option>
          </Field>
          <ErrorMessage name="tag" component="div" className={css.error} />
        </div>

        <div className={css.actions}>
          <button 
            type="submit" 
            className={css.submitButton}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Creating...' : 'Create'}
          </button>
          <button type="button" onClick={onClose} className={css.cancelButton}>
            Cancel
          </button>
        </div>
      </Form>
    </Formik>
  );
}