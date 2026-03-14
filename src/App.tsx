import { RouterProvider } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { router } from './router';

function App() {
  return (
    <ProgressProvider>
      <RouterProvider router={router} />
    </ProgressProvider>
  );
}

export default App;
