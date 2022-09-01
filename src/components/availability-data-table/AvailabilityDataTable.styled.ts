import styled from 'styled-components';

export const AvailabilityDataTableContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SearchGroupContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

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

export const BookReservationInfoListContainer = styled.ul`
  margin: 10px;
`