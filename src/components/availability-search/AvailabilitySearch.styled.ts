import styled from 'styled-components';
import Select from 'react-select';

export const SearchGroupContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 50px;

  .react-daterange-picker__wrapper {
    padding: 5px;
    border-radius: 10px;
    margin-right: 20px;
  }

  @media only screen and (max-width: 1023px) {
    flex-direction: column;

    .react-daterange-picker__wrapper {
      margin-right: 0px;
    }
  }
`;

export const SearchWrapper = styled.span`
  display: flex;
  align-items: center;

  @media only screen and (max-width: 1023px) {
    margin-bottom: 20px;
  };
`;

export const IconWrapper = styled.span`
  margin-right: 10px;
`;

export const BookRatingSelect = styled(Select)`
  margin-right: 20px;

  > div {
    border-radius: 10px;
    border: thin solid gray;
  }

  @media only screen and (max-width: 1023px) {
    margin-right: 0px;
  }
`;