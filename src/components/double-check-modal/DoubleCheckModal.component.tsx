import {
  Button,
  Modal
} from 'react-bootstrap';

import LoaderContainer from '../../containers/LoaderContainer';

export enum OKButtonStyle {
  danger='danger',
  success='success'
};

const DoubleCheckModal = ({
  modalShown,
  handleModalCloseNo,
  handleModalCloseYes,
  modalTitle = <p>Warning</p>,
  modalBody = <p>Are you sure to do this? This action is irreversible.</p>,
  okButtonStyle = OKButtonStyle.danger,
}: {
  modalShown: boolean,
  handleModalCloseNo: () => void,
  handleModalCloseYes: () => void,
  modalTitle?: JSX.Element,
  modalBody?: JSX.Element,
  okButtonStyle?: OKButtonStyle,
}) => {
  const [loading] = LoaderContainer.useContainer();

  return (
    <Modal
      id='double-check-modal'
      size='lg'
      centered
      show={modalShown}
      onHide={handleModalCloseNo}
    >
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modalBody}
      </Modal.Body>
      <Modal.Footer>
        <Button
          id='double-check-close-button'
          variant='secondary'
          onClick={handleModalCloseNo}
          disabled={loading}
        >
          Close
        </Button>
        <Button
          id='double-check-ok-button'
          variant={okButtonStyle}
          onClick={handleModalCloseYes}
          disabled={loading}
        >
          Yes!
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DoubleCheckModal;