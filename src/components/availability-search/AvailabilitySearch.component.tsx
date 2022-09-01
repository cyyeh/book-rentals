import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import makeAnimated from 'react-select/animated';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faStar } from '@fortawesome/free-solid-svg-icons';

import {
  SearchGroupContainer,
  SearchWrapper,
  IconWrapper,
  BookRatingSelect,
} from './AvailabilitySearch.styled';

const ratingOptions = [
  {
    value: 0,
    label: 'All'
  }, {
    value: 1,
    label: '≥ 1'
  }, {
    value: 2,
    label: '≥ 2'
  }, {
    value: 3,
    label: '≥ 3'
  }, {
    value: 4,
    label: '≥ 4'
  }, {
    value: 5,
    label: '5'
  }
];

const animatedComponents = makeAnimated();

const AvailabilitySearch = ({
  dateRange,
  onChangeDateRangeSelect,
  onChangeRatingSelect,
}: {
  dateRange: Date[],
  onChangeDateRangeSelect: (newValue: any) => void,
  onChangeRatingSelect: (newValue: any) => void,
}) => {
  const handleChangeDateRangeSelect = (newValue: any) => {
    onChangeDateRangeSelect(newValue);
  };

  const handleChangeRatingSelect = (newValue: any) => {
    onChangeRatingSelect(newValue.value);
  };

  return (
    <SearchGroupContainer>
      <SearchWrapper>
        <IconWrapper>
          <FontAwesomeIcon icon={faCalendar} size="lg" />
        </IconWrapper>
        <DateRangePicker
          onChange={newValue => handleChangeDateRangeSelect(newValue)}
          value={dateRange}
          minDate={new Date()}
          clearIcon={null}
        />
      </SearchWrapper>
      <SearchWrapper>
        <IconWrapper>
          <FontAwesomeIcon icon={faStar} size='lg' />
        </IconWrapper>
        <BookRatingSelect
          options={ratingOptions}
          components={animatedComponents}
          defaultValue={ratingOptions[0]}
          placeholder='Select a rating'
          onChange={newValue => handleChangeRatingSelect(newValue)}
        />
      </SearchWrapper>
    </SearchGroupContainer>
  );
};

export default AvailabilitySearch;
