import styled from 'styled-components';
import { Button } from 'react-bootstrap';

export const BookDataTableContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CreateBookButton = styled(Button)`
  width: 150px;
  display: flex;
  align-self: flex-end;
  margin-bottom: 10px;
`;