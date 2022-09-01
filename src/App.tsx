import firebase from 'firebase/compat/app';
import { Navigate, Outlet } from 'react-router-dom';
import {
  Container,
  Nav,
  Navbar,
} from 'react-bootstrap';

import { User, UserRole } from './firebase/users/apis';
import LoaderContainer from './containers/LoaderContainer';
import { MainContentContainer, NavbarCollapse } from './App.styled';

const App = ({ userData }: { userData: User | undefined }) => {
  const [, loader] = LoaderContainer.useContainer();

  if (!userData) {
    return (
      <Navigate to='/login' replace={true} />
    );
  }

  const signOut = () => {
    firebase.auth().signOut();
  }

  return (
    <>
    <Navbar bg='light' expand='lg'>
      <Container>
        <Navbar.Brand href='/'>Book Rentals</Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <NavbarCollapse id='basic-navbar-nav'>
          <Nav>
            {userData?.role === UserRole.manager && <Nav.Link href='/admin' id='admin-button'>Admin</Nav.Link>}
            <Nav.Link id='signout-button' onClick={() => signOut()}>Sign out</Nav.Link>
          </Nav>
        </NavbarCollapse>
      </Container>
    </Navbar>
    {loader}
    <MainContentContainer>
      <Outlet />
    </MainContentContainer>
    </>
  )
}

export default App;
