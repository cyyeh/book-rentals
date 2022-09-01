import { useState } from 'react';
import { Button } from 'react-bootstrap';

import { User } from '../../firebase/users/apis';
import AvailabilityDataTable from '../../components/availability-data-table/AvailabilityDataTable.component';
import UserReservationDataTable from '../../components/user-reservation-data-table/UserReservationDataTable.component';
import {
  PageTitleContainer,
  UserPortalContainer,
  PortalButtonGroupContainer,
  PortalContentContainer,
} from './User.styled';

enum UserPortalFunctionType {
  availabilitySearch='availabilitySearch',
  reservationCheck='reservationCheck'
}

const UserPage = ({ userData }: { userData: User | undefined }) => {
  const [userPortalFunction, setUserPortalFunction] = useState<UserPortalFunctionType>(UserPortalFunctionType.availabilitySearch);

  const handleSelectUserPortalFunctionType = (newUserPortalFunctionType: UserPortalFunctionType) => {
    setUserPortalFunction(newUserPortalFunctionType);
  };

  return (
    <>
      <PageTitleContainer>
        <h1>Enjoy your read!</h1>
        <p id='welcome-message'>Welcome <strong>{userData?.name}</strong>, now you can rent any available book you love!</p>
      </PageTitleContainer>
      <UserPortalContainer>
        <PortalButtonGroupContainer>
          <Button
            variant='outline-secondary'
            size='lg'
            active={userPortalFunction === UserPortalFunctionType.availabilitySearch}
            onClick={() => handleSelectUserPortalFunctionType(UserPortalFunctionType.availabilitySearch)}
          >
            Rent a book
          </Button>
          <Button
            variant='outline-secondary'
            size='lg'
            active={userPortalFunction === UserPortalFunctionType.reservationCheck}
            onClick={() => handleSelectUserPortalFunctionType(UserPortalFunctionType.reservationCheck)}
          >
            Your reservations
          </Button>
        </PortalButtonGroupContainer>
        <PortalContentContainer>
          {
            userPortalFunction === UserPortalFunctionType.availabilitySearch && userData &&
            <AvailabilityDataTable userData={userData} />
          }
          {
            userPortalFunction === UserPortalFunctionType.reservationCheck && userData &&
            <UserReservationDataTable />
          }
        </PortalContentContainer>
      </UserPortalContainer>
    </>
  )
}

export default UserPage;
