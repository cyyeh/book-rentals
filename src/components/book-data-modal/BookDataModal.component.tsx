import { useState, useEffect } from 'react';
import {
  Button,
  Form,
  Modal
} from 'react-bootstrap';

import LoaderContainer from '../../containers/LoaderContainer';
import DoubleCheckModal from '../double-check-modal/DoubleCheckModal.component';
import MessageBox, { MessageStyle } from '../message-box/MessageBox.component';
import { 
  Book,
  deleteBook,
  updateBook,
  createBook
} from '../../firebase/books/apis';
import { DeleteBookButton } from './BookDataModal.styled';

const BookDataModal = (
  { id, bookData, modalShown, handleModalClose, isCreateBook = false }:
  { id: string, bookData: Book, modalShown: boolean, handleModalClose: () => void, isCreateBook?: boolean }
) => {
  const [loading, _, addLoader, removeLoader] = LoaderContainer.useContainer();
  const [name, setName] = useState<string>(bookData.name);
  const [author, setAuthor] = useState<string>(bookData.author);
  const [isbn, setIsbn] = useState<string>(bookData.isbn);
  const [url, setUrl] = useState<string>(bookData.url);
  const [message, setMessage] = useState('');
  const [doubleCheckModalShown, setDoubleCheckModalShown] = useState(false);

  useEffect(() => {
    setName(bookData.name);
  }, [bookData.name]);

  useEffect(() => {
    setAuthor(bookData.author);
  }, [bookData.author]);

  useEffect(() => {
    setIsbn(bookData.isbn);
  }, [bookData.isbn]);

  useEffect(() => {
    setUrl(bookData.url);
  }, [bookData.url]);

  const handleClickDeleteBookButton = () => {
    setDoubleCheckModalShown(true);
  };

  const handleClickSaveButton = () => {
    const updateBookAction = async () => {
      await updateBook({
        ...bookData,
        name,
        author,
        isbn,
        url,
      });
      handleModalClose();
    };

    const createBookAction = async () => {
      const bookData = {
        id: '',
        name,
        author,
        isbn,
        url,
        ratingSum: 0,
        ratingCount: 0,
      } as Book;

      await createBook(bookData);
      handleModalClose();
    };

    addLoader();
    if (isCreateBook) {
      createBookAction();
    } else {
      updateBookAction();
    }
    removeLoader();
  };

  const handleClickDoubleCheckModalOKButton = () => {
    const removeBookAction = async () => {
      await deleteBook(bookData.id);
      setDoubleCheckModalShown(false);
      handleModalClose();
    };

    addLoader();
    removeBookAction();
    removeLoader();
  };

  const handleMessageChange = (message: string): void => {
    setMessage(message);
  };

  return (
    <>
    <Modal id={id} size='lg' centered show={modalShown} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>Book Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className='mb-3' controlId='form-name'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type='text'
              placeholder='Book Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className='mb-3' controlId='form-author'>
            <Form.Label>Author</Form.Label>
            <Form.Control
              type='text'
              placeholder='Book Author'
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className='mb-3' controlId='form-isbn'>
            <Form.Label>ISBN</Form.Label>
            <Form.Control
              type='text'
              placeholder='Book ISBN'
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className='mb-3' controlId='form-url'>
            <Form.Label>Url</Form.Label>
            <Form.Control
              type='url'
              placeholder='Book Url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {
          !isCreateBook &&
          <DeleteBookButton
            id='delete-book-button'
            variant='danger'
            disabled={loading}
            onClick={() => handleClickDeleteBookButton()}
          >
            Delete this book
          </DeleteBookButton>
        }
        <Button
          id='close-modal-button'
          variant='secondary'
          disabled={loading}
          onClick={handleModalClose}
        >
          Close
        </Button>
        <Button
          id='save-book-button'
          variant='primary'
          disabled={loading}
          onClick={() => handleClickSaveButton()}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
    {
      doubleCheckModalShown &&
      <DoubleCheckModal
        modalShown={doubleCheckModalShown}
        handleModalCloseNo={() => setDoubleCheckModalShown(false)}
        handleModalCloseYes={() => handleClickDoubleCheckModalOKButton()}
      />
    }
    {
      message.length > 0 &&
      <MessageBox
        header='Oops! Something is wrong.'
        content={message}
        messageStyle={MessageStyle.error}
        messageOnChange={handleMessageChange}
      />
    }
    </>
  );
};

export default BookDataModal;
