import { Spinner } from 'react-bootstrap';

import { LoadingSpinnerContainer } from './LoadingSpinner.styled';

const LoadingSpinner = () => {
  return (
    <LoadingSpinnerContainer>
      <Spinner animation='grow' />
      <Spinner animation='grow' />
      <Spinner animation='grow' />
    </LoadingSpinnerContainer>
  );
};

export default LoadingSpinner;
