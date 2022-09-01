import styled from 'styled-components';

export const TableRow = styled.tr`
  cursor: ${props => props.className === 'clickable' ? 'pointer' : 'initial'};
`;