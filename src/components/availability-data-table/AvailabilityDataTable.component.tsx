import { useEffect, useState, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import { Timestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import {
  User,
} from '../../firebase/users/apis';
import {
  BookDataWithAvailabilityInfo,
} from '../../firebase/books/apis';
import {
  getBooksWithAvailabilityInfo,
  makeBookReservation,
  RentalStatus,
} from '../../firebase/rentals/apis';
import LoaderContainer from '../../containers/LoaderContainer';
import AvailabilitySearch from '../availability-search/AvailabilitySearch.component';
import DoubleCheckModal, { OKButtonStyle } from '../double-check-modal/DoubleCheckModal.component';
import DataTable from '../data-table/DataTable.component';
import {
  AvailabilityDataTableContainer,
  BookReservationInfoListContainer,
} from './AvailabilityDataTable.styled';

const today = new Date();

const BookReservationInformation = ({
  reservationDateRange, bookData
}: {
  reservationDateRange: Date[], bookData: BookDataRow
}) => {
  const [reservationStartDate, reservationEndDate] = reservationDateRange;

  return (
    <>
    <p>Great! So are you sure to make reservation to this book?</p>
    <hr/>
    <strong>Book Reservation Information</strong>
    <BookReservationInfoListContainer>
      <li>Reservation Time: {reservationStartDate.toDateString()} - {reservationEndDate.toDateString()}</li>
      <li>Name: {bookData.name}</li>
      <li>Author: {bookData.author}</li>
      <li>ISBN: {bookData.isbn}</li>
      <li>Url: {bookData.url}</li>
      <li>Average Rating: {bookData.averageRating}</li>
    </BookReservationInfoListContainer>
    </>
  );
};

type BookDataRow = {
  id: string,
  name: string,
  author: string,
  isbn: string,
  url: string,
  averageRating: string,
  available: boolean | JSX.Element,
};

const AvailabilityDataTable = ({
  userData,
}: {
  userData: User,
}) => {
  const [loading, loader, addLoader, removeLoader] = LoaderContainer.useContainer();
  const [reservationDateRange, setReservationDateRange] = useState<Date[]>([today, today]);
  const [rating, setRating] = useState<number>(0);
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
      }, {
        Header: 'Available',
        accessor: 'available',
      },
    ]
  }, []);
  const [books, setBooks] = useState<BookDataWithAvailabilityInfo[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookDataRow | undefined>(undefined);
  const [doubleCheckModalShown, setDoubleCheckModalShown] = useState(false);
  const booksTableData = useMemo(() => {
    const newBooksData = books.filter((book) => {
      return (
        book.averageRating >= rating
      );
    });

    const newBooksTableData: BookDataRow[] = [];
    for (const book of newBooksData) {
      newBooksTableData.push({
        id: book.id,
        name: book.name,
        author: book.author,
        isbn: book.isbn,
        url: book.url,
        averageRating: book.averageRating.toFixed(2),
        available: book.available && <FontAwesomeIcon icon={faCheck} size='lg' />,
      });
    }

    return newBooksTableData;
  }, [books, rating]);

  useEffect(() => {
    const fetchAvailableBooks = async () => {
      const [reservationStartDate, reservationEndDate] = reservationDateRange;
      const booksDataWithAvailabilityInfo = await getBooksWithAvailabilityInfo(
        Timestamp.fromDate(reservationStartDate),
        Timestamp.fromDate(reservationEndDate)
      );
      if (booksDataWithAvailabilityInfo != null) {
        setBooks(booksDataWithAvailabilityInfo);
      }
    };

    if (!doubleCheckModalShown) {
      addLoader();
      fetchAvailableBooks();
      removeLoader();
    }
  }, [firebase.auth().currentUser, reservationDateRange, doubleCheckModalShown]);

  const handleDateRangeSelect = (newValue: any) => {
    setReservationDateRange(newValue);
  };

  const hangleChangeRatingSelect = (newValue: any) => {
    setRating(newValue);
  };

  const handleClickRow = (row: BookDataRow) => {
    if (row.available) {
      setSelectedBook(row);
      setDoubleCheckModalShown(true);
    }
  };

  const handleClickDoubleCheckModalOKButton = () => {
    const makeBookReservationAction = async () => {
      const [reservationStartDate, reservationEndDate] = reservationDateRange;

      await makeBookReservation({
        id: '',
        bookId: selectedBook!.id,
        userId: userData.id,
        startTime: Timestamp.fromDate(reservationStartDate),
        endTime: Timestamp.fromDate(reservationEndDate),
        status: RentalStatus.reserved,
        rating: null,
      });
      setDoubleCheckModalShown(false);
      setSelectedBook(undefined);
    };

    addLoader();
    makeBookReservationAction();
    removeLoader();
  };

  return (
    <AvailabilityDataTableContainer>
      <AvailabilitySearch
        dateRange={reservationDateRange}
        onChangeDateRangeSelect={
          (newValue) => handleDateRangeSelect(newValue)
        }
        onChangeRatingSelect={
          (newValue) => hangleChangeRatingSelect(newValue)
        }
      />
      <DataTable
        columns={bookDataColumns}
        data={booksTableData}
        onClickRow={(row) => handleClickRow(row.original)}
      />
      {
        selectedBook && doubleCheckModalShown &&
        <DoubleCheckModal 
          modalShown={doubleCheckModalShown}
          handleModalCloseNo={() => setDoubleCheckModalShown(false)}
          handleModalCloseYes={() => handleClickDoubleCheckModalOKButton()}
          modalTitle={<p>Just one more click!</p>}
          modalBody={
            <BookReservationInformation
              reservationDateRange={reservationDateRange}
              bookData={selectedBook}
            />
          }
          okButtonStyle={OKButtonStyle.success}
        />
      }
    </AvailabilityDataTableContainer>
  );
};

export default AvailabilityDataTable;
