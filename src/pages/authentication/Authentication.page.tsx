import firebase from 'firebase/compat/app';
import { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import { User, UserRole, createUser, getUser } from '../../firebase/users/apis';
import LoaderContainer from '../../containers/LoaderContainer';
import MessageBox, { MessageStyle } from '../../components/message-box/MessageBox.component';
import {
  AuthenticationPageContainer,
  AuthenticationFormContainer,
  SiteTitle,
  FormContainer,
  ButtonContainer,
} from './Authentication.styled';

const AuthenticationPage = (
  { userData, onChangeUserData }: { userData: User | undefined, onChangeUserData: ((user: User | undefined) => void) }
) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [loading, loader, addLoader, removeLoader] = LoaderContainer.useContainer();

  useEffect(() => {
    if (userData) {
      navigate('/')
    }
  }, [userData]);

  const isFormValid = (): boolean => {
    if (!email || !password) return false;

    return true;
  }

  const handleMessageChange = (message: string): void => {
    setMessage(message);
  }

  const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    addLoader();
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then(async userCredential => {
        const user = userCredential.user;
        const userData = {
          id: user.uid,
          name: user.email,
          email: user.email,
          role: UserRole.user,
        } as User;

        await createUser(userData);
        onChangeUserData(userData);
        navigate('/');
      })
      .catch(error => {
        const errorCode = error.code;
        if (errorCode === 'auth/email-already-in-use') {
          setMessage('Email is already in use.');
        } else {
          setMessage('Something is wrong...please try again later.');
        }
      })
      .finally(() => {
        removeLoader();
      });
  }

  const handleSignin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    addLoader();
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(async userCredential => {
        const userData = await getUser(userCredential.user!.uid);
        onChangeUserData(userData);
        navigate('/');
      })
      .catch(error => {
        const errorCode = error.code;
        if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
          setMessage('Email or password is wrong.');
        } else {
          setMessage('Something is wrong...please try again later.');
        }
      })
      .finally(() => {
        removeLoader();
      });
  }

  return (
    <>
      <>{loader}</>
      <AuthenticationPageContainer>
        <AuthenticationFormContainer>
          <SiteTitle>Book Rentals</SiteTitle>
          <FormContainer validated={isFormValid()}>
            <Form.Group className='mb-3' controlId='email-input'>
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='password-input'>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Password'
                value={password}
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            <ButtonContainer>
              <Button
                id='signup-button'
                variant='primary'
                disabled={!isFormValid() || loading}
                onClick={handleSignup}
              >
                Sign up
              </Button>
              <Button
                id='signin-button'
                variant='primary'
                disabled={!isFormValid() || loading}
                onClick={handleSignin}
              >
                Sign in
              </Button>
            </ButtonContainer>
          </FormContainer>
        </AuthenticationFormContainer>
        {
          message.length > 0 &&
          <MessageBox
            header='Oops! Something is wrong.'
            content={message}
            messageStyle={MessageStyle.error}
            messageOnChange={handleMessageChange}
          />
        }
      </AuthenticationPageContainer>
    </>
  );
}

export default AuthenticationPage;
