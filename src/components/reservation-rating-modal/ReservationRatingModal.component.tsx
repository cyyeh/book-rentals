import { useState } from 'react';
import {
  Button,
  Modal,
} from 'react-bootstrap';
import RangeSlider from 'react-bootstrap-range-slider';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';

import {
  rateBookPastReservation,
  finishBookReservation,
} from '../../firebase/rentals/apis';
import LoaderContainer from '../../containers/LoaderContainer';
import {
  ActiveReservationData,
  PastReservationData,
} from '../user-reservation-data-table/UserReservationDataTable.component';

const ReservationRatingModal = ({
  reservationData, modalShown, handleModalClose, isRatingPastReservation = true,
}: {
  reservationData: ActiveReservationData | PastReservationData,
  modalShown: boolean,
  handleModalClose: () => void,
  isRatingPastReservation?: boolean
}) => {
  const [loading,, addLoader, removeLoader] = LoaderContainer.useContainer();
  const [rating, setRating] = useState(() => {
    if (reservationData.hasOwnProperty('rating')) {
      return (reservationData as PastReservationData).rating ?? 3;
    }

    return 3;
  });

  const handleClickOKButton = () => {
    const ratePastReservationAction = async () => {
      await rateBookPastReservation(reservationData.id, reservationData.bookId, rating);
      handleModalClose();
    };

    const rateAndFinishReservationAction = async () => {
      await finishBookReservation(reservationData.id, reservationData.bookId, rating);
      handleModalClose();
    };

    addLoader();
    if (isRatingPastReservation) {
      ratePastReservationAction();
    } else {
      rateAndFinishReservationAction();
    }
    removeLoader();
  };

  return (
    <>
    <Modal
      id='reservation-rating-modal'
      size='lg'
      centered
      show={modalShown}
      onHide={handleModalClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Please let us know your feelings to the rental experience</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Thanks for using our book rental service. You can now rate your rental experience now from 0 to 5.</p>
        <RangeSlider
          value={rating}
          onChange={e => setRating(parseInt(e.target.value))}
          min={1}
          max={5}
          size='sm'
          tooltip='on'
          disabled={loading}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleModalClose} disabled={loading}>
          Close
        </Button>
        <Button
          variant='primary'
          onClick={() => handleClickOKButton()}
          disabled={loading}
        >
          Ok!
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default ReservationRatingModal;
