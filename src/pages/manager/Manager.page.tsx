import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import { User, UserRole } from '../../firebase/users/apis';
import UserDataTable from '../../components/user-data-table/UserDataTable.component';
import BookDataTable from '../../components/book-data-table/BookDataTable.component';
import ReservationDataTable from '../../components/reservation-data-table/ReservationDataTable.component';
import {
  PageTitleContainer,
  ManagementPortalContainer,
  PortalButtonGroupContainer,
  PortalContentContainer,
} from './Manager.styled';

enum ManagementType {
  users='users',
  books='books',
  reservations='reservations',
}

const ManagerPage = ({ userData }: { userData: User | undefined }) => {
  const [management, setManagement] = useState<ManagementType>(ManagementType.users);

  if (userData && userData.role === UserRole.user) {
    return (
      <Navigate to='/' replace={true} />
    );
  }

  const handleSelectManagementType = (newManagementType: ManagementType) => {
    setManagement(newManagementType);
  };

  const handleClickGenerateFakeUsersButton = () => {
    const generateFakeUsersAction = async () => {
      const { createFakeUsers } = await import('../../firebase/users/apis');

      await createFakeUsers();
    };
    
    generateFakeUsersAction();
  };

  const handleClickGenerateFakeBooksButton = () => {
    const generateFakeBooksAction = async () => {
      const { createFakeBooks } = await import('../../firebase/books/apis');

      await createFakeBooks();
    };

    generateFakeBooksAction();
  };

  return (
    <>
      {
        import.meta.env.DEV &&
        <>
        <h3>Development Mode</h3>
        <PortalButtonGroupContainer>
          <Button
            variant='outline-secondary'
            size='lg'
            onClick={() => handleClickGenerateFakeUsersButton()}
          >
            Generate fake users
          </Button>
          <Button
            variant='outline-secondary'
            size='lg'
            onClick={() => handleClickGenerateFakeBooksButton()}
          >
            Generate fake books
          </Button>
        </PortalButtonGroupContainer>
        </>
      }
      <PageTitleContainer>
        <h1>Management Portal</h1>
        <p>Welcome <strong>{userData?.name}</strong>, you are signed in!</p>
      </PageTitleContainer>
      <ManagementPortalContainer>
        <PortalButtonGroupContainer>
          <Button
            variant='outline-secondary'
            size='lg'
            active={management === ManagementType.users}
            onClick={() => handleSelectManagementType(ManagementType.users)}
          >
            Users
          </Button>
          <Button
            variant='outline-secondary'
            size='lg'
            active={management === ManagementType.books}
            onClick={() => handleSelectManagementType(ManagementType.books)}
          >
            Books
          </Button>
          <Button
            variant='outline-secondary'
            size='lg'
            active={management === ManagementType.reservations}
            onClick={() => handleSelectManagementType(ManagementType.reservations)}
          >
            Reservations
          </Button>
        </PortalButtonGroupContainer>
        <PortalContentContainer>
          {
            management === ManagementType.users &&
            <UserDataTable />
          }
          {
            management === ManagementType.books &&
            <BookDataTable />
          }
          {
            management === ManagementType.reservations &&
            <ReservationDataTable />
          }
        </PortalContentContainer>
      </ManagementPortalContainer>
    </>
  )
}

export default ManagerPage;
