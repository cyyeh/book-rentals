import { Link } from 'react-router-dom';

import { NotFoundPageContainer } from './NotFound.styled';

const NotFoundPage = () => {
  return (
    <NotFoundPageContainer>
      <h2>This page does not exist.</h2>
      <p>Go back to <Link to='/'>home page</Link></p>
    </NotFoundPageContainer>
  );
}

export default NotFoundPage;
