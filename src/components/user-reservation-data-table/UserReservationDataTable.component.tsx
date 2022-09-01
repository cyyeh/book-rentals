import { useState, useEffect, useMemo } from 'react';
import firebase from 'firebase/compat/app';

import {
  Reservation,
  RentalStatus,
  getBookReservationsForCurrentUser,
  getDateOnly,
  cancelBookReservation,
} from '../../firebase/rentals/apis';
import LoaderContainer from '../../containers/LoaderContainer';
import DataTable from '../data-table/DataTable.component';
import ReservationRatingModal from '../reservation-rating-modal/ReservationRatingModal.component';
import DoubleCheckModal from '../double-check-modal/DoubleCheckModal.component';
import {
  ReservationDataTableContainer,
  ActiveReservationDataTableContainer,
  ActiveReservationTitle,
  PastReservationDataTableContainer,
  PastReservationTitle,
} from './UserReservationDataTable.styled';

export type ActiveReservationData = {
  id: string,
  bookId: string,
  name: string,
  author: string,
  isbn: string,
  url: string,
  averageRating: string,
  startTime: string,
  endTime: string,
  status: RentalStatus,
};

export type PastReservationData = {
  id: string,
  bookId: string,
  name: string,
  author: string,
  isbn: string,
  url: string,
  startTime: string,
  endTime: string,
  status: RentalStatus,
  rating: number | null
};

const UserReservationDataTable = () => {
  const [,, addLoader, removeLoader] = LoaderContainer.useContainer();
  const [activeReservations, setActiveReservations] = useState<Reservation[]>([]);
  const [pastReservations, setPastReservations] = useState<Reservation[]>([]);
  const activeReservationsColumns = useMemo(() => {
    return [
      {
        Header: 'Reservation ID',
        accessor: 'id',
      }, {
        Header: 'Book ID',
        accessor: 'bookId',
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
        Header: 'Start date',
        accessor: 'startTime',
      }, {
        Header: 'End date',
        accessor: 'endTime',
      }, {
        Header: 'Status',
        accessor: 'status'
      },
    ]
  }, []);
  const activeReservationsTableData = useMemo(() => {
    const activeReservationsData = activeReservations.map((reservation) => {
      return {
        id: reservation.id,
        bookId: reservation.bookData.id,
        name: reservation.bookData.name,
        author: reservation.bookData.author,
        isbn: reservation.bookData.isbn,
        url: reservation.bookData.url,
        averageRating: reservation.bookData.ratingCount === 0 ? '0.00' : (reservation.bookData.ratingSum / reservation.bookData.ratingCount).toFixed(2),
        startTime: reservation.startTime.toDate().toDateString(),
        endTime: reservation.endTime.toDate().toDateString(),
        status: reservation.status,
      } as ActiveReservationData;
    });

    return activeReservationsData;
  }, [activeReservations]);
  const pastReservationsColumns = useMemo(() => {
    return [
      {
        Header: 'Reservation ID',
        accessor: 'id',
      }, {
        Header: 'Book ID',
        accessor: 'bookId',
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
        Header: 'Start date',
        accessor: 'startTime',
      }, {
        Header: 'End date',
        accessor: 'endTime',
      }, {
        Header: 'Status',
        accessor: 'status'
      }, {
        Header: 'Rating',
        accessor: 'rating',
      },
    ]
  }, []);
  const pastReservationsTableData = useMemo(() => {
    const pastReservationsData = pastReservations.map((reservation) => {
      return {
        id: reservation.id,
        bookId: reservation.bookData.id,
        name: reservation.bookData.name,
        author: reservation.bookData.author,
        isbn: reservation.bookData.isbn,
        url: reservation.bookData.url,
        startTime: reservation.startTime.toDate().toDateString(),
        endTime: reservation.endTime.toDate().toDateString(),
        status: reservation.status,
        rating: reservation.rating,
      } as PastReservationData;
    });

    return pastReservationsData;
  }, [pastReservations]);
  const [selectedReservationDataRow, setSelectedReservationDataRow] = useState<PastReservationData | ActiveReservationData | undefined>(undefined);
  const [ratingModalShown, setRatingModalShown] = useState(false);
  const [doubleCheckModalShown, setDoubleCheckModalShown] = useState(false);

  useEffect(() => {
    const getReservationsDataAction = async () => {
      const reservationsData = await getBookReservationsForCurrentUser();
      if (reservationsData != null) {
        setActiveReservations(reservationsData.active);
        setPastReservations(reservationsData.past);
      }
    };

    if (!ratingModalShown && !doubleCheckModalShown) {
      addLoader();
      getReservationsDataAction();
      removeLoader();
    }
  }, [firebase.auth().currentUser, ratingModalShown, doubleCheckModalShown]);

  const handleClickActiveReservationsTableRow = (row: ActiveReservationData) => {
    const reservationData = activeReservations.filter(reservation => reservation.id === row.id);
    if (reservationData.length === 1) {
      setSelectedReservationDataRow(row);
      if (getDateOnly(new Date()) < getDateOnly(reservationData[0].startTime.toDate())) {
        setDoubleCheckModalShown(true);
      } else {
        setRatingModalShown(true);
      }
    }
  };

  const handleClickPastReservationsTableRow = (row: PastReservationData) => {
    if (row.rating == null && row.status === RentalStatus.reserved) {
      setSelectedReservationDataRow(row);
      setRatingModalShown(true);
    }
  };

  const handleClickDoubleCheckModalOKButton = () => {
    const cancelReservationAction = async () => {
      await cancelBookReservation(selectedReservationDataRow!.id);
      setDoubleCheckModalShown(false);
      setSelectedReservationDataRow(undefined);
    };

    addLoader();
    cancelReservationAction();
    removeLoader();
  };

  return (
    <ReservationDataTableContainer>
      <ActiveReservationDataTableContainer>
        <ActiveReservationTitle>Active Reservations</ActiveReservationTitle>
        <DataTable
          columns={activeReservationsColumns}
          data={activeReservationsTableData}
          onClickRow={(row) => handleClickActiveReservationsTableRow(row.original)}
        />
      </ActiveReservationDataTableContainer>
      <PastReservationDataTableContainer>
        <PastReservationTitle>Past Reservations</PastReservationTitle>
        <DataTable
          columns={pastReservationsColumns}
          data={pastReservationsTableData}
          onClickRow={(row) => handleClickPastReservationsTableRow(row.original)}
        />
      </PastReservationDataTableContainer>
      {
        ratingModalShown && selectedReservationDataRow &&
        <ReservationRatingModal
          reservationData={selectedReservationDataRow}
          modalShown={ratingModalShown}
          handleModalClose={() => setRatingModalShown(false)}
          isRatingPastReservation={selectedReservationDataRow.hasOwnProperty('rating')}
        />
      }
      {
        doubleCheckModalShown && selectedReservationDataRow &&
        <DoubleCheckModal
          modalShown={doubleCheckModalShown}
          handleModalCloseNo={() => setDoubleCheckModalShown(false)}
          handleModalCloseYes={() => handleClickDoubleCheckModalOKButton()}
          modalTitle={<p>One more click to cancel the reservation</p>}
          modalBody={<p>Are you sure to cancel the reservation right now? This action is irreversible.</p>}
        />
      }
    </ReservationDataTableContainer>
  );
};

export default UserReservationDataTable;
