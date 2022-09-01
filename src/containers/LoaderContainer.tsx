import { useState } from 'react';
import { createContainer } from 'unstated-next';

import LoadingSpinner from '../components/loading-spinner/LoadingSpinner.component';

const useLoading = (): [boolean, JSX.Element | null, () => void, () => void] => {
  const [loading, setLoading] = useState(false);

  const addLoader = () => {
    setLoading(true);
  }

  const removeLoader = () => {
    setLoading(false);
  }

  return [
    loading,
    loading ? <LoadingSpinner /> : null,
    addLoader,
    removeLoader,
  ]
};

const LoaderContainer = createContainer(useLoading);
export default LoaderContainer;
