import { useState, useEffect } from 'react';
import {
  Button,
  Form,
  Modal
} from 'react-bootstrap';
import firebase from 'firebase/compat/app';

import LoaderContainer from '../../containers/LoaderContainer';
import DoubleCheckModal from '../double-check-modal/DoubleCheckModal.component';
import MessageBox, { MessageStyle } from '../../components/message-box/MessageBox.component';
import { User, UserRole, deleteUser, updateUser, createUser } from '../../firebase/users/apis';
import { firebaseConfig } from '../../firebase/index';
import { DeleteUserButton } from './UserDataModal.styled';

const UserDataModal = (
  { id, userData, modalShown, handleModalClose, isCreateUser = false }:
  { id: string, userData: User, modalShown: boolean, handleModalClose: () => void, isCreateUser?: boolean }
) => {
  const [loading,, addLoader, removeLoader] = LoaderContainer.useContainer();
  const [email, setEmail] = useState(userData.email);
  const [password, setPassword] = useState('');
  const [name, setName] = useState(userData.name);
  const [role, setRole] = useState<UserRole>(userData.role);
  const [message, setMessage] = useState('');
  const [doubleCheckModalShown, setDoubleCheckModalShown] = useState(false);

  useEffect(() => {
    setName(userData.name);
  }, [userData.name]);

  useEffect(() => {
    setRole(userData.role as UserRole);
  }, [userData.role]);

  const handleClickDeleteUserButton = () => {
    setDoubleCheckModalShown(true);
  };

  const handleClickSaveButton = () => {
    const updateUserAction = async () => {
      await updateUser({
        ...userData,
        name,
        role
      });
      handleModalClose();
    };

    const createUserAction = async () => {
      const secondayFirebaseApp = firebase.initializeApp(firebaseConfig, 'secondary');
      secondayFirebaseApp.auth().createUserWithEmailAndPassword(email, password)
        .then(async userCredential => {
          const user = userCredential.user!;
          const userData = {
            id: user.uid,
            name: name,
            email: user.email,
            role: role,
          } as User;
  
          await createUser(userData);
        })
        .then(() => {
          secondayFirebaseApp.auth().signOut();
        }).then(() => {
          secondayFirebaseApp.delete();
          handleModalClose();
        })
        .catch(error => {
          const errorCode = error.code;
          if (errorCode === 'auth/email-already-in-use') {
            setMessage('Email is already in use.');
          } else {
            setMessage('Something is wrong...please try again later.');
          }
        });
    };

    addLoader();
    if (isCreateUser) {
      createUserAction();
    } else {
      updateUserAction();
    }
    removeLoader();
  };

  const handleClickDoubleCheckModalOKButton = () => {
    const removeUserAction = async () => {
      await deleteUser(userData.id);
      setDoubleCheckModalShown(false);
      handleModalClose();
    };

    addLoader();
    removeUserAction();
    removeLoader();
  };

  const handleMessageChange = (message: string): void => {
    setMessage(message);
  };

  return (
    <>
    <Modal id={id} size='lg' centered show={modalShown} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>User Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className='mb-3' controlId='form-email'>
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type='email'
              placeholder='name@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={isCreateUser ? false : true}
              autoFocus={isCreateUser ? true : false}
              disabled={loading}
            />
          </Form.Group>
          {
            isCreateUser &&
            <Form.Group className='mb-3' controlId='form-password'>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Password'
                value={password}
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Form.Text className='text-muted'>
                Its length should be at least 6.
              </Form.Text>
            </Form.Group>
          }
          <Form.Group className='mb-3' controlId='form-name'>
            <Form.Label>User Name</Form.Label>
            <Form.Control
              type='text'
              placeholder='User Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={isCreateUser ? false : true}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className='mb-3' controlId='form-role'>
            <Form.Label>User Role</Form.Label>
            <div>
              <Form.Check
                inline
                label='manager'
                name='role'
                type='radio'
                id='manager'
                checked={role === UserRole.manager}
                onChange={(e) => setRole(e.currentTarget.id as UserRole)}
                disabled={loading}
              />
              <Form.Check
                inline
                label='user'
                name='role'
                type='radio'
                id='user'
                checked={role === UserRole.user}
                onChange={(e) => setRole(e.currentTarget.id as UserRole)}
                disabled={loading}
              />
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {
          firebase.auth().currentUser && firebase.auth().currentUser!.uid !== userData.id && !isCreateUser &&
          <DeleteUserButton
            id='delete-user-button'
            variant='danger'
            onClick={() => handleClickDeleteUserButton()}
            disabled={loading}
          >
            Delete
          </DeleteUserButton>
        }      
        <Button
          id='close-modal-button'
          variant='secondary'
          onClick={handleModalClose}
        >
          Close
        </Button>
        <Button
          id='save-user-button'
          variant='primary'
          disabled={loading || (isCreateUser ? (!name || !email) : !name)}
          onClick={() => handleClickSaveButton()}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
    {
      doubleCheckModalShown &&
      <DoubleCheckModal 
        modalShown={doubleCheckModalShown}
        handleModalCloseNo={() => setDoubleCheckModalShown(false)}
        handleModalCloseYes={() => handleClickDoubleCheckModalOKButton()}
      />
    }
    {
      message.length > 0 &&
      <MessageBox
        header='Oops! Something is wrong.'
        content={message}
        messageStyle={MessageStyle.error}
        messageOnChange={handleMessageChange}
      />
    }
    </>
  );
};

export default UserDataModal;