import styled from 'styled-components';

export const SearchGroupContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 50px;

  .input-group {
    width: 50%;
  }

  @media only screen and (max-width: 767px) {
    .input-group {
      width: 100%;
    }
  }
`;
