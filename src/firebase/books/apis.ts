import firebase from 'firebase/compat/app';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

import { firebaseDB } from '../index';
import { getUser, UserRole } from '../users/apis';

export type Book = {
  id: string,
  name: string,
  author: string,
  isbn: string,
  url: string,
  ratingSum: number,
  ratingCount: number,
};

export type BookDataWithAvailabilityInfo = {
  id: string,
  name: string,
  author: string,
  isbn: string,
  url: string,
  averageRating: number,
  available: boolean,
};

export const booksCollectionName = import.meta.env.DEV ? 'books-dev' : 'books';

export const getBooks = async (): Promise<Book[] | undefined> => {
  if (firebase.auth().currentUser == null) return;

  const querySnapshot = await getDocs(collection(firebaseDB, booksCollectionName));
  const booksData: Book[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    booksData.push({
      id: doc.id,
      ...data,
    } as Book);
  });

  return booksData;
};

export const getBook = async (bookId: string): Promise<Book | undefined> => {
  if (firebase.auth().currentUser == null) return;

  const docRef = doc(firebaseDB, booksCollectionName, bookId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const bookData = docSnap.data();
    return {
      id: bookId,
      ...bookData,
    } as Book;
  }

  return undefined;
};

// this function assumes api issuer is already signed in
const isBookValidForCreateOrUpdate = async (
  apiIsserId: string, bookData: Book
): Promise<boolean> => {
  const {
    name,
    author,
    isbn,
  } = bookData;

  if (
    !name ||
    !author ||
    !isbn
  ) return false;
  const user = await getUser(apiIsserId);
  if (!user || user.role !== UserRole.manager) return false;

  return true;
};

export const createBook = async (bookData: Book) => {
  if (firebase.auth().currentUser == null) return;
  const apiIssuerId = firebase.auth().currentUser!.uid;

  const {
    name,
    author,
    isbn,
    url,
  } = bookData;

  // validation
  const bookValid = await isBookValidForCreateOrUpdate(apiIssuerId, bookData);
  if (!bookValid) return;

  try {
    await addDoc(collection(firebaseDB, booksCollectionName), {
      name,
      author,
      isbn,
      url,
      ratingSum: 0,
      ratingCount: 0,
    });
  } catch (e) {
    console.log(`Error creating book: ${e}`);
  }
};

export const updateBook = async (bookData: Book) => {
  if (firebase.auth().currentUser == null) return;
  const apiIssuerId = firebase.auth().currentUser!.uid;

  const {
    id,
    name,
    author,
    isbn,
    url,
  } = bookData;

  // validation
  const bookValid = await isBookValidForCreateOrUpdate(apiIssuerId, bookData);
  if (!bookValid) return;

  try {
    const docRef = doc(firebaseDB, booksCollectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        name,
        author,
        isbn,
        url,
      });
    } else {
      console.log(`This book doesn't exist`);
    }
  } catch (e) {
    console.log(`Error updating book: ${e}`);
  }
};

// this function assumes api issuer is already signed in
const isBookValidForDelete = async (apiIssuerId: string): Promise<boolean> => {
  const apiIssuer = await getUser(apiIssuerId);
  if (!apiIssuer || apiIssuer.role !== UserRole.manager) return false;

  return true;
};

export const deleteBook = async (bookId: string) => {
  if (firebase.auth().currentUser == null) return;
  const apiIssuerId = firebase.auth().currentUser!.uid;

  // validation
  const bookValid = await isBookValidForDelete(apiIssuerId);
  if (!bookValid) return;

  try {
    await deleteDoc(doc(firebaseDB, booksCollectionName, bookId));
  } catch (e) {
    console.log(`Error deleting book: ${e}`);
  }
};


//// Generating fake books, only for development mode
const createFakeBook = async (fakeBookData: Book) => {
  await createBook(fakeBookData);
};

export const createFakeBooks = async () => {
  const fakeBooksCount = 5;
  const fakeBooksData: (Book | undefined)[] = new Array(fakeBooksCount);

  for (let i = 0; i < fakeBooksCount; i++) {
    fakeBooksData[i] = {
      id: '',
      name: `fake-book-${i}-${Date.now()}`,
      author: `fake-author-${i}-${Date.now()}`,
      isbn: `fake-isbn-${i}-${Date.now()}`,
      url: `http://fake-url-${i}-${Date.now()}`,
      ratingSum: 0,
      ratingCount: 0,
    };
  }

  for (const fakeBookData of fakeBooksData) {
    await createFakeBook(fakeBookData as Book);
  }
};