import { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

export enum MessageStyle {
  info='light',
  error='warning'
};

const MessageBox = (
  { header, content, messageOnChange, messageStyle = MessageStyle.info }:
  { header: string, content: string, messageOnChange: (message: string) => void, messageStyle: MessageStyle }
) => {
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (!shown) {
      messageOnChange('');
    }
  }, [shown])

  return (
    <ToastContainer position='top-center' className='p-3'>
      <Toast
        bg={messageStyle}
        show={shown}
        onClose={() => setShown(false)}
        delay={2000}
        autohide
      >
        <Toast.Header>
          <strong className='me-auto'>{header}</strong>
        </Toast.Header>
        <Toast.Body>{content}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default MessageBox;
