import { AuthProvider } from '@/context/AuthContext';
import LayoutShell from '@/components/layout/LayoutShell';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <LayoutShell>
        <Component {...pageProps} />
      </LayoutShell>
    </AuthProvider>
  );
}
