import firebase from 'firebase/compat/app';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

import { firebaseDB, firebaseConfig } from '../index';

export enum UserRole {
  manager='manager',
  user='user'
};

export type User = {
  id: string,
  name: string,
  email: string,
  role: UserRole,
};

const usersCollectionName = import.meta.env.DEV ? 'users-dev' : 'users';

const isUserExisted = async (email: string): Promise<boolean> => {
  const q = query(collection(firebaseDB, usersCollectionName), where('email', '==', email));
  const docs = await getDocs(q);
  return docs.size > 0 ? true : false;
};

export const getUsers = async (): Promise<User[] | undefined> => {
  if (firebase.auth().currentUser == null) return;

  const querySnapshot = await getDocs(collection(firebaseDB, usersCollectionName));
  const usersData: User[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    usersData.push({
      id: doc.id,
      ...data,
    } as User);
  });

  return usersData;
};

export const getUser = async (userId: string): Promise<User | undefined> => {
  if (firebase.auth().currentUser == null) return;

  const docRef = doc(firebaseDB, usersCollectionName, userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const userData = docSnap.data();
    return {
      id: userId,
      ...userData,
    } as User;
  }

  return undefined;
};

// this function assumes api issuer is already signed in
const isUserValidForCreate = async (
  apiIssuerId: string, userData: User
): Promise<boolean> => {
  const {
    id,
    name,
    email,
    role
  } = userData;

  if (!name || !email || !role) return false;

  const userExisted = await isUserExisted(email);
  if (userExisted) return false;
  if (!Object.values(UserRole).includes(role)) return false;
  // in this case, one user is creating another new user, only manager is allowed
  if (apiIssuerId !== id) {
    const apiIssuer = await getUser(apiIssuerId);
    if (!apiIssuer || apiIssuer.role !== UserRole.manager) return false;
  }

  return true;
};

export const createUser = async (userData: User) => {
  if (firebase.auth().currentUser == null) return;
  const apiIssuerId = firebase.auth().currentUser!.uid;

  const {
    id,
    name,
    email,
    role
  } = userData;

  // validation
  const userValid = await isUserValidForCreate(apiIssuerId, userData);
  if (!userValid) return;

  try {
    await setDoc(doc(firebaseDB, usersCollectionName, id), {
      name, email, role
    });
    console.log('New user is created!');
  } catch (e) {
    console.log(`Error creating user: ${e}`);
  }
};

// this function assumes api issuer is already signed in
const isUserValidForUpdate = async (
  apiIssuerId: string, userData: User
): Promise<boolean> => {
  const {
    email,
    name,
    role
  } = userData;

  if (!name || !role || !email) return false;
  if (!Object.values(UserRole).includes(role)) return false;
  const apiIssuer = await getUser(apiIssuerId);
  if (!apiIssuer || apiIssuer.role !== UserRole.manager) return false;

  return true;
};

export const updateUser = async (userData: User) => {
  if (firebase.auth().currentUser == null) return;
  const apiIssuerId = firebase.auth().currentUser!.uid;

  const {
    id,
    name,
    role
  } = userData;

  // validation
  const userValid = await isUserValidForUpdate(apiIssuerId, userData);
  if (!userValid) return;

  try {
    const docRef = doc(firebaseDB, usersCollectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // at the moment, we only allow managers to update 'name' and 'role' field
      await updateDoc(docRef, {
        name,
        role,
      });
    } else {
      console.log(`This user doesn't exist`);
    }
  } catch (e) {
    console.log(`Error updating user: ${e}`);
  }
};

// this function assumes api issuer is already signed in
const isUserValidForDelete = async (apiIssuerId: string): Promise<boolean> => {
  const apiIssuer = await getUser(apiIssuerId);
  if (!apiIssuer || apiIssuer.role !== UserRole.manager) return false;

  return true;
};

export const deleteUser = async (userId: string) => {
  if (firebase.auth().currentUser == null) return;
  const apiIssuerId = firebase.auth().currentUser!.uid;

  // validation
  const userValid = await isUserValidForDelete(apiIssuerId);
  if (!userValid) return;

  try {
    await deleteDoc(doc(firebaseDB, usersCollectionName, userId));
  } catch (e) {
    console.log(`Error deleting user: ${e}`);
  }
};


//// Generating fake users, only for development mode
const createFakeUser = async (fakeUserData: User, fakeUserPassword: string) => {
  const {
    email,
    name,
    role
  } = fakeUserData;

  const secondayFirebaseApp = firebase.initializeApp(firebaseConfig, 'secondary');
  secondayFirebaseApp.auth().createUserWithEmailAndPassword(email, fakeUserPassword)
    .then(async userCredential => {
      const user = userCredential.user!;
      const userData = {
        id: user.uid,
        name: name,
        email: email,
        role: role,
      } as User;

      await createUser(userData);
    })
    .then(() => {
      secondayFirebaseApp.auth().signOut();
    }).then(() => {
      secondayFirebaseApp.delete();
    })
    .catch(error => {
      const errorCode = error.code;
      console.log(errorCode);
    });
};

export const createFakeUsers = async () => {
  const fakeUsersCount = 5;
  const fakeUserPassword = '123456';
  const fakeUsersData: (User | undefined)[] = new Array(fakeUsersCount);

  for (let i = 0; i < fakeUsersCount; i++) {
    fakeUsersData[i] = {
      id: '',
      name: `${(new Date().getTime() + i).toString()}-dev@gmail.com`,
      email: `${(new Date().getTime() + i).toString()}-dev@gmail.com`,
      role: UserRole.user,
    };
  }

  for (const fakeUserData of fakeUsersData) {
    await createFakeUser(fakeUserData as User, fakeUserPassword);
  }
};
