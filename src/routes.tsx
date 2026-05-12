import { createBrowserRouter } from 'react-router';
import { Layout } from './app/components/Layout.tsx';
import { Landing } from './screens/Landing.tsx';
import { Register } from './screens/Register.tsx';
import { Dashboard } from './screens/Dashboard.tsx';
import { DataEntry } from './screens/DataEntry.tsx';
import { StudentInput } from './screens/StudentInput.tsx';
import { CarbonReport } from './screens/CarbonReport.tsx';
import { Recommendations } from './screens/Recommendations.tsx';
import { ActionPlan } from './screens/ActionPlan.tsx';
import { ImpactLedger } from './screens/ImpactLedger.tsx';
import { Support } from './screens/Support.tsx';
import { Leaderboard } from './screens/Leaderboard.tsx';
import { Verification } from './screens/Verification.tsx';

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
    path: '/',
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
