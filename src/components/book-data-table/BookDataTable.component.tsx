import { useState, useEffect, useMemo } from 'react';
import firebase from 'firebase/compat/app';

import {
  getBooks,
  Book,
} from '../../firebase/books/apis';
import LoaderContainer from '../../containers/LoaderContainer';
import DataTable from '../data-table/DataTable.component';
import BookDataModal from '../book-data-modal/BookDataModal.component';
import { BookDataTableContainer, CreateBookButton } from './BookDataTable.styled';

export type BooksTableData = {
  id: string,
  name: string,
  author: string,
  isbn: string,
  url: string,
  averageRating: string,
};

const BookDataTable = () => {
  const [,, addLoader, removeLoader] = LoaderContainer.useContainer();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);
  const [modalShown, setModalShown] = useState(false);
  const bookDataColumns = useMemo(() => {
    return [
      {
        Header: 'Book ID',
        accessor: 'id',
      }, {
        Header: 'Name',
        accessor: 'name',
      }, {
        Header: 'Author',
        accessor: 'author',
      }, {
        Header: 'ISBN',
        accessor: 'isbn',
      }, {
        Header: 'Url',
        accessor: 'url',
      }, {
        Header: 'Average Rating',
        accessor: 'averageRating',
      },
    ]
  }, []);
  const booksTableData = useMemo(() => {
    const newBooksTableData: BooksTableData[] = [];
    for (const book of books) {
      newBooksTableData.push({
        id: book.id,
        name: book.name,
        author: book.author,
        isbn: book.isbn,
        url: book.url,
        averageRating: book.ratingCount === 0 ? '0' : (book.ratingSum / book.ratingCount).toFixed(2),
      });
    }

    return newBooksTableData;
  }, [books]);

  useEffect(() => {
    const fetchBooks = async () => {
      const booksData = await getBooks();
      if (booksData != null) {
        setBooks(booksData);
      }
    };

    if (!modalShown) {
      addLoader();
      fetchBooks();
      removeLoader();
    }
  }, [firebase.auth().currentUser, modalShown]);

  const handleClickRow = (row: Book) => {
    setSelectedBook(row);
    setModalShown(true);
  };

  const handleClickCreateBookButton = () => {
    setSelectedBook(undefined);
    setModalShown(true);
  };

  return (
    <BookDataTableContainer>
      {
        selectedBook && modalShown &&
        <BookDataModal
          id='update-book-modal'
          bookData={selectedBook}
          modalShown={modalShown}
          handleModalClose={() => setModalShown(false)}
        />
      }
      {
        !selectedBook && modalShown &&
        <BookDataModal
          id='create-book-modal'
          bookData={{
            id: '',
            name: '',
            author: '',
            isbn: '',
            url: '',
            ratingCount: 0,
            ratingSum: 0.0,
          }}
          modalShown={modalShown}
          handleModalClose={() => setModalShown(false)}
          isCreateBook={true}
        />
      }
      <CreateBookButton
        variant='outline-success'
        onClick={() => handleClickCreateBookButton()}
      >
        Create new book
      </CreateBookButton>
      <DataTable
        columns={bookDataColumns}
        data={booksTableData}
        onClickRow={(row) => handleClickRow(row.original)}
      />
    </BookDataTableContainer>
  );
};

export default BookDataTable;