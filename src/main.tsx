import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import App from './App';
import AuthenticationPage from './pages/authentication/Authentication.page';
import ManagerPage from './pages/manager/Manager.page';
import UserPage from './pages/user/User.page';
import NotFoundPage from './pages/notfound/NotFound.page';
import LoaderContainer from './containers/LoaderContainer';
import { User, getUser } from './firebase/users/apis';

import './index.css';


const Main = () => {
  const [userData, setUserData] = useState<User | undefined>(() => {
    let userObject = localStorage.getItem('User');
    return userObject ? JSON.parse(userObject) as User : undefined;
  });

  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(async user => {
      let newUserData: User | undefined;

      if (!!user) {
        newUserData = await getUser(user.uid);
      }

      handleChangeUserData(newUserData);
    });

    return () => unregisterAuthObserver();
  }, []);

  const handleChangeUserData = (newUserData: User | undefined): void => {
    if (!newUserData) {
      localStorage.removeItem('User');
    } else {
      localStorage.setItem('User', JSON.stringify(newUserData));
    }
    
    setUserData(newUserData);
  }

  return (
    <LoaderContainer.Provider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App userData={userData} />}>
            <Route index element={<UserPage userData={userData} />} />
            <Route path='admin' element={<ManagerPage userData={userData} />} />
          </Route>
          <Route path='/login' element={
            <AuthenticationPage
              userData={userData}
              onChangeUserData={(userData) => handleChangeUserData(userData)}
            />
          }/>
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </LoaderContainer.Provider>
  );
}

ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
).render(<Main />);
