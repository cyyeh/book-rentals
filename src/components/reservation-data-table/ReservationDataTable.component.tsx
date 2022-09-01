import { useState, useEffect, useMemo } from 'react';
import firebase from 'firebase/compat/app';

import {
  Reservation,
  RentalStatus,
  getBookReservationsForAllUsers,
} from '../../firebase/rentals/apis';
import LoaderContainer from '../../containers/LoaderContainer';
import DataTable from '../data-table/DataTable.component';
import ReservationSearch from '../reservation-search/ReservationSearch.component';
import {
  ReservationDataTableContainer,
} from './ReservationDataTable.styled';

export type ReservationData = {
  id: string,
  userId: string,
  bookId: string,
  email: string,
  startTime: string,
  endTime: string,
  status: RentalStatus,
  rating: number | null
};

const ReservationDataTable = () => {
  const [,, addLoader, removeLoader] = LoaderContainer.useContainer();
  const [searchText, setSearchText] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const reservationsColumns = useMemo(() => {
    return [
      {
        Header: 'Reservation ID',
        accessor: 'id',
      }, {
        Header: 'User ID',
        accessor: 'userId',
      }, {
        Header: 'User email',
        accessor: 'email',
      }, {
        Header: 'Book ID',
        accessor: 'bookId',
      }, {
        Header: 'Start date',
        accessor: 'startTime',
      }, {
        Header: 'End date',
        accessor: 'endTime',
      }, {
        Header: 'Status',
        accessor: 'status',
      }, {
        Header: 'Rating',
        accessor: 'rating',
      }
    ];
  }, []);
  const reservationsTableData = useMemo(() => {
    const filteredReservationsData = reservations.filter((reservation) => {
      if (searchText) {
        return (
          reservation.userData.id === searchText ||
          reservation.userData.email === searchText ||
          reservation.bookData.id === searchText
        );
      }

      return true;
    });

    const reservationsData = filteredReservationsData.map((reservation) => {
      return {
        id: reservation.id,
        userId: reservation.userData.id,
        bookId: reservation.bookData.id,
        email: reservation.userData.email,
        startTime: reservation.startTime.toDate().toDateString(),
        endTime: reservation.endTime.toDate().toDateString(),
        status: reservation.status,
        rating: reservation.rating,
      } as ReservationData;
    });

    return reservationsData;
  }, [reservations, searchText]);

  useEffect(() => {
    const getReservationsDataAction = async () => {
      const reservationsData = await getBookReservationsForAllUsers();
      if (reservationsData != null) {
        setReservations(reservationsData);
      }
    };

    addLoader();
    getReservationsDataAction();
    removeLoader();
  }, [firebase.auth().currentUser]);

  const handleChangeSearchText = (newValue: string) => {
    setSearchText(newValue);
  };

  // we don't need to do anything here
  const handleClickReservationsTableRow = (row: any) => {};

  return (
    <ReservationDataTableContainer>
      <ReservationSearch
        searchText={searchText}
        onChangeSearchText={(newSearchText) => handleChangeSearchText(newSearchText)}
      />
      <DataTable
        columns={reservationsColumns}
        data={reservationsTableData}
        onClickRow={handleClickReservationsTableRow}
        clickable={false}
      />
    </ReservationDataTableContainer>
  );
};

export default ReservationDataTable;
