import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Landing } from './screens/Landing';
import { Register } from './screens/Register';
import { Dashboard } from './screens/Dashboard';
import { DataEntry } from './screens/DataEntry';
import { StudentInput } from './screens/StudentInput';
import { CarbonReport } from './screens/CarbonReport';
import { Recommendations } from './screens/Recommendations';
import { ActionPlan } from './screens/ActionPlan';
import { ImpactLedger } from './screens/ImpactLedger';
import { Support } from './screens/Support';
import { Leaderboard } from './screens/Leaderboard';
import { Verification } from './screens/Verification';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/student-input',
    element: <StudentInput />,
  },
  {
    path: '/public/impact-ledger',
    element: <ImpactLedger />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'data-entry',
        element: <DataEntry />,
      },
      {
        path: 'carbon-report',
        element: <CarbonReport />,
      },
      {
        path: 'recommendations',
        element: <Recommendations />,
      },
      {
        path: 'action-plan',
        element: <ActionPlan />,
      },
      {
        path: 'support',
        element: <Support />,
      },
      {
        path: 'leaderboard',
        element: <Leaderboard />,
      },
      {
        path: 'impact-ledger',
        element: <ImpactLedger />,
      },
      {
        path: 'verification',
        element: <Verification />,
      },
    ],
  },
]);
