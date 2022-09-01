import styled from 'styled-components';
import { Button } from 'react-bootstrap';

export const UserDataTableContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CreateUserButton = styled(Button)`
  width: 150px;
  display: flex;
  align-self: flex-end;
  margin-bottom: 10px;
`;