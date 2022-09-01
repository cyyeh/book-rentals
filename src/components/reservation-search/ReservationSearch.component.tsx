import {
  Form,
  InputGroup,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

import {
  SearchGroupContainer,
} from './ReservationSearch.styled';

const ReservationSearch = ({ searchText, onChangeSearchText }: {
  searchText: string, onChangeSearchText: (value: string) => void
}) => {
  return (
    <SearchGroupContainer>
      <InputGroup className='mb-3'>
        <InputGroup.Text id='text-input'>
          <FontAwesomeIcon icon={faMagnifyingGlass} size='lg' />
        </InputGroup.Text>
        <Form.Control
          placeholder="Search by user id/email or book id..."
          aria-label="search"
          aria-describedby="text-input"
          value={searchText}
          onChange={(e) => onChangeSearchText(e.target.value)}
        />
      </InputGroup>
    </SearchGroupContainer>
  );
};

export default ReservationSearch;
