import { useState, useEffect, useMemo } from 'react';
import firebase from 'firebase/compat/app';

import { User, getUsers, UserRole } from '../../firebase/users/apis';
import LoaderContainer from '../../containers/LoaderContainer';
import DataTable from '../data-table/DataTable.component';
import UserDataModal from '../user-data-modal/UserDataModal.component';
import { UserDataTableContainer, CreateUserButton } from './UserDataTable.styled';

const UserDataTable = () => {
  const [,, addLoader, removeLoader] = LoaderContainer.useContainer();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [modalShown, setModalShown] = useState(false);
  const columns = useMemo(() => {
    return [
      {
        Header: 'User ID',
        accessor: 'id',
      }, {
        Header: 'User Name',
        accessor: 'name',
      }, {
        Header: 'Email',
        accessor: 'email',
      }, {
        Header: 'User Role',
        accessor: 'role',
      }
    ]
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = await getUsers();
      if (usersData != null) {
        setUsers(usersData);
      }
    };

    if (!modalShown) {
      addLoader();
      fetchUsers();
      removeLoader();
    }
  }, [firebase.auth().currentUser, modalShown]);

  const handleClickRow = (row: User) => {
    setSelectedUser(row);
    setModalShown(true);
  };

  const handleClickCreateUserButton = () => {
    setSelectedUser(undefined);
    setModalShown(true);
  };

  return (
    <UserDataTableContainer>
      {
        selectedUser && modalShown &&
        <UserDataModal
          id='update-user-modal'
          userData={selectedUser}
          modalShown={modalShown}
          handleModalClose={() => setModalShown(false)}
        />
      }
      {
        !selectedUser && modalShown &&
        <UserDataModal
          id='create-user-modal'
          userData={{
            id: '',
            email: '',
            name: '',
            role: UserRole.user,
          }}
          modalShown={modalShown}
          handleModalClose={() => setModalShown(false)}
          isCreateUser={true}
        />
      }
      <CreateUserButton
        variant='outline-success'
        onClick={() => handleClickCreateUserButton()}
      >
        Create new user
      </CreateUserButton>
      <DataTable
        columns={columns}
        data={users}
        onClickRow={(row) => handleClickRow(row.original)}
      />
    </UserDataTableContainer>
  );
};

export default UserDataTable;
