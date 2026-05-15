import { RouterProvider } from 'react-router';
import { LanguageProvider } from './components/LanguageContext';
import { router } from './routes';

export default function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}