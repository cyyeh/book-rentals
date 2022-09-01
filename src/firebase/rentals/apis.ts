import firebase from 'firebase/compat/app';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';

import { firebaseDB } from '../index';
import { getUser, User, UserRole } from '../users/apis';
import { Book, BookDataWithAvailabilityInfo, getBook, getBooks, booksCollectionName } from '../books/apis';

export enum RentalStatus {
  cancelled = 'cancelled',
  reserved = 'reserved',
};

export type Rental = {
  id: string,
  bookId: string,
  userId: string,
  startTime: Timestamp,
  endTime: Timestamp,
  status: RentalStatus,
  rating: number | null
};

export type Reservation = {
  id: string,
  bookData: Book,
  userData: User,
  startTime: Timestamp,
  endTime: Timestamp,
  status: RentalStatus,
  rating: number | null
};

export type Reservations = {
  active: Reservation[],
  past: Reservation[],
};

const ratingMax = 5;
const ratingMin = 0;
const rentalsCollectionName = import.meta.env.DEV ? 'rentals-dev' : 'rentals';
const today = new Date();

export const getDateOnly = (date: Date) => {
  // discards hours, minutes, seconds, ...
  return new Date(date).setHours(0, 0, 0, 0);
};

const getRentals = async (): Promise<Rental[] | undefined> => {
  if (firebase.auth().currentUser == null) return;

  const querySnapshot = await getDocs(collection(firebaseDB, rentalsCollectionName));
  const rentalsData: Rental[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    rentalsData.push({
      id: doc.id,
      ...data,
    } as Rental);
  });

  return rentalsData;
};

const getReservations = async (): Promise<Reservation[] | undefined> => {
  if (firebase.auth().currentUser == null) return;

  const querySnapshot = await getDocs(collection(firebaseDB, rentalsCollectionName));
  const reservationsData: Reservation[] = [];
  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    const [userData, bookData] = await Promise.all([
      getUser(data.userId),
      getBook(data.bookId),
    ]);
    if (userData != null && bookData != null) {
      const {
        status,
        startTime,
        endTime,
        rating,
      } = data;

      reservationsData.push({
        id: doc.id,
        status,
        startTime,
        endTime,
        rating,
        bookData,
        userData,
      } as Reservation);
    }
  }

  return reservationsData;
};

// this function assumes api issuer is already signed in
const getRental = async (rentalId: string): Promise<Rental | undefined> => {
  const docRef = doc(firebaseDB, rentalsCollectionName, rentalId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const rentalData = docSnap.data();
    return {
      id: rentalId,
      ...rentalData,
    } as Rental;
  }

  return undefined;
};

const makeRentalsDataByBookId = (rentalsData: Rental[]): {[bookId: string]: Rental[]} => {
  const rentalsDataByBookId: {[bookId: string]: Rental[]} = {};

  for (const rental of rentalsData) {
    if (!(rental.bookId in rentalsDataByBookId)) {
      rentalsDataByBookId[rental.bookId] = [rental];
    } else {
      rentalsDataByBookId[rental.bookId].push(rental);
    }
  }

  return rentalsDataByBookId;
};

// this function assumes api issuer is already signed in
const isBookAvailable = (
  startTime: Timestamp,
  endTime: Timestamp,
  bookData: Book,
  rentalsDataByBookId: { [bookId: string]: Rental[] }
): boolean => {
  if (!(bookData.id in rentalsDataByBookId) || rentalsDataByBookId[bookData.id].length === 0) return true;

  let bookAvailable = true;
  for (const rentalData of rentalsDataByBookId[bookData.id]) {
    if (rentalData.status === RentalStatus.reserved && rentalData.rating == null && (
      (
        getDateOnly(rentalData.startTime.toDate()) <= getDateOnly(startTime.toDate()) &&
        getDateOnly(rentalData.endTime.toDate()) >= getDateOnly(startTime.toDate())
      )
      ||
      (
        getDateOnly(rentalData.startTime.toDate()) >= getDateOnly(startTime.toDate()) &&
        getDateOnly(rentalData.startTime.toDate()) <= getDateOnly(endTime.toDate())
      )
    )) return false;
  }

  return bookAvailable;
};


export const getBooksWithAvailabilityInfo = async (
  startTime: Timestamp = Timestamp.fromDate(today),
  endTime: Timestamp = Timestamp.fromDate(today)
): Promise<BookDataWithAvailabilityInfo[] | undefined> => {
  if (firebase.auth().currentUser == null) return;

  const booksData = await getBooks();
  if (booksData == null || booksData.length == 0) return [];

  const rentalsData = await getRentals();
  if (rentalsData == null || rentalsData.length == 0) {
    return booksData.map((bookData)  => {
      return {
        id: bookData.id,
        name: bookData.name,
        author: bookData.author,
        isbn: bookData.isbn,
        url: bookData.url,
        averageRating: bookData.ratingCount === 0 ? 0 : (bookData.ratingSum / bookData.ratingCount),
        available: true,
      };
    })
  };

  const rentalsDataByBookId = makeRentalsDataByBookId(rentalsData);

  const booksDataWithAvailabilityInfo = booksData.map((bookData) => {
    return {
      id: bookData.id,
      name: bookData.name,
      author: bookData.author,
      isbn: bookData.isbn,
      url: bookData.url,
      averageRating: bookData.ratingCount === 0 ? 0 : (bookData.ratingSum / bookData.ratingCount),
      available: isBookAvailable(startTime, endTime, bookData, rentalsDataByBookId),
    };
  });

  return booksDataWithAvailabilityInfo;
};

// this function assumes api issuer is already signed in
const isBookReservationValidForCreate = async (apiIssuerId: string, rentalData: Rental): Promise<boolean> => {
  const {
    bookId,
    userId,
    status,
    startTime,
    endTime,
    rating,
  } = rentalData;

  if (
    apiIssuerId !== userId ||
    !bookId ||
    !userId ||
    !status ||
    !startTime ||
    !endTime ||
    getDateOnly(startTime.toDate()) > getDateOnly(endTime.toDate()) ||
    getDateOnly(startTime.toDate()) < getDateOnly(today) ||
    rating != null ||
    status !== RentalStatus.reserved
  ) return false;

  const bookData = await getBook(bookId);
  if (bookData == null) return false;

  const userData = await getUser(userId);
  if (userData == null) return false;

  const rentalsData = await getRentals();
  if (rentalsData == null || rentalsData.length == 0) return true;

  const rentalsDataByBookId = makeRentalsDataByBookId(rentalsData);
  const bookAvailable = await isBookAvailable(startTime, endTime, bookData, rentalsDataByBookId);
  if (!bookAvailable) return false;

  return true;
};

export const makeBookReservation = async (rentalData: Rental) => {
  if (firebase.auth().currentUser == null) return;
  const apiIssuerId = firebase.auth().currentUser!.uid;

  // validation
  const bookReservationValid = await isBookReservationValidForCreate(apiIssuerId, rentalData);
  if (!bookReservationValid) return;

  try {
    await addDoc(collection(firebaseDB, rentalsCollectionName), {
      bookId: rentalData.bookId,
      userId: rentalData.userId,
      startTime: rentalData.startTime,
      endTime: rentalData.endTime,
      status: RentalStatus.reserved,
      rating: null,
    });
  } catch (e) {
    console.log(`Error making book reservation: ${e}`);
  }
};

// this function assumes api issuer is already signed in
const isBookReservationValidForDelete = async (apiIssuerId: string, rentalId: string): Promise<boolean> => {
  const apiIssuer = await getUser(apiIssuerId);
  if (!apiIssuer) return false;

  const rental = await getRental(rentalId);
  if (!rental) return false;
  if (rental.status !== RentalStatus.reserved) return false;
  if (rental.userId !== apiIssuerId) return false;

  return true;
};

export const cancelBookReservation = async (rentalId: string) => {
  if (firebase.auth().currentUser == null) return;
  const apiIssuerId = firebase.auth().currentUser!.uid;

  // validation
  const bookReservationValid = await isBookReservationValidForDelete(apiIssuerId, rentalId);
  if (!bookReservationValid) return;

  try {
    const docRef = doc(firebaseDB, rentalsCollectionName, rentalId);
    await updateDoc(docRef, {
      status: RentalStatus.cancelled,
    });
  } catch (e) {
    console.log(`Error cancelling the book reservation: ${e}`);
  };
};

// this function assumes api issuer is already signed in
const isBookReservationValidForFinish = async (apiIssuerId: string, rentalId: string, rating?: number) => {
  const apiIssuer = await getUser(apiIssuerId);
  if (!apiIssuer) return false;

  const rental = await getRental(rentalId);
  if (!rental) return false;
  if (rental.status !== RentalStatus.reserved) return false;
  if (rental.userId !== apiIssuerId) return false;
  if (rating != null && (rating < ratingMin || rating > ratingMax)) return false;

  return true;
};

export const finishBookReservation = async (rentalId: string, bookId: string, rating: number) => {
  if (firebase.auth().currentUser == null) return;
  const apiIssuerId = firebase.auth().currentUser!.uid;

  // validation
  const bookReservationValid = await isBookReservationValidForFinish(apiIssuerId, rentalId, rating);
  if (!bookReservationValid) return;

  try {
    const rentalDocRef = doc(firebaseDB, rentalsCollectionName, rentalId);
    const bookDocRef = doc(firebaseDB, booksCollectionName, bookId);
    try {
      await runTransaction(firebaseDB, async (transaction) => {
        const bookDoc = await transaction.get(bookDocRef);
        if (!bookDoc.exists()) {
          throw 'this book document does not exist!'
        }
  
        if (rating != null) {
          transaction.update(rentalDocRef, { rating });
          transaction.update(bookDocRef, {
            ratingCount: bookDoc.data().ratingCount + 1,
            ratingSum: bookDoc.data().ratingSum + rating
          });
        }
      });
    } catch (e) {
      console.log(`Error rating the book past reservation: ${e}`);
    }
  } catch (e) {
    console.log(`Error finishing the book reservation: ${e}`);
  }
};

export const getBookReservationsForCurrentUser = async (): Promise<Reservations | undefined> => {
  if (firebase.auth().currentUser == null) return;
  const apiIssuerId = firebase.auth().currentUser!.uid;

  const reservationsData = await getReservations();
  if (reservationsData == null || reservationsData.length == 0) return;

  const reservationsDataForApiIssuer = reservationsData.filter((reservationData) => {
    return reservationData.userData.id === apiIssuerId;
  });

  const activeReservations: Reservation[] = [];
  const pastReservations: Reservation[] = [];
  for (const reservationData of reservationsDataForApiIssuer) {
    if (
      reservationData.status === RentalStatus.cancelled
      ||
      (
        reservationData.status === RentalStatus.reserved &&
        reservationData.rating != null
      )
      ||
      getDateOnly(reservationData.endTime.toDate()) < getDateOnly(today)
    ) {
      pastReservations.push(reservationData);
    } else {
      activeReservations.push(reservationData);
    }
  }

  return {
    active: activeReservations,
    past: pastReservations,
  };
};

export const getBookReservationsForAllUsers = async (): Promise<Reservation[] | undefined> => {
  if (firebase.auth().currentUser == null) return;
  const apiIssuerId = firebase.auth().currentUser!.uid;

  const userData = await getUser(apiIssuerId);
  if (userData == null || userData.role !== UserRole.manager) return;

  const reservationsData = await getReservations();
  if (reservationsData == null || reservationsData.length == 0) return;

  return reservationsData;
};

// this function assumes api issuer is already signed in
const isBookReservationValidForRate = async (apiIssuerId: string, rentalId: string, rating: number) => {
  const apiIssuer = await getUser(apiIssuerId);
  if (!apiIssuer) return false;

  const rental = await getRental(rentalId);
  if (!rental) return false;
  if (rental.status === RentalStatus.cancelled) return false;
  if (rental.userId !== apiIssuerId) return false;
  if (rating < ratingMin || rating > ratingMax) return false;

  return true;
};

export const rateBookPastReservation = async (rentalId: string, bookId: string, rating: number) => {
  if (firebase.auth().currentUser == null) return;
  const apiIssuerId = firebase.auth().currentUser!.uid;

  // validation
  const bookReservationValid = await isBookReservationValidForRate(apiIssuerId, rentalId, rating);
  if (!bookReservationValid) return;

  const rentalDocRef = doc(firebaseDB, rentalsCollectionName, rentalId);
  const bookDocRef = doc(firebaseDB, booksCollectionName, bookId);
  try {
    await runTransaction(firebaseDB, async (transaction) => {
      const bookDoc = await transaction.get(bookDocRef);
      if (!bookDoc.exists()) {
        throw 'this book document does not exist!'
      }

      transaction.update(rentalDocRef, { rating });
      transaction.update(bookDocRef, {
        ratingCount: bookDoc.data().ratingCount + 1,
        ratingSum: bookDoc.data().ratingzSum + rating
      });
    });
  } catch (e) {
    console.log(`Error rating the book past reservation: ${e}`);
  }
};
