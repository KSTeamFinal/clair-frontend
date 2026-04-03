import { createBrowserRouter } from 'react-router-dom';
import { StartScreen } from './screens/StartScreen';
import { Onboarding } from './screens/Onboarding';
import { Login } from './screens/Login';
import { SignUp } from './screens/SignUp';
import { Home } from './screens/Home';
import { Upload } from './screens/Upload';
import { Loading } from './screens/Loading';
import { ResultDashboard } from './screens/ResultDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StartScreen />,
  },
  {
    path: '/onboarding',
    element: <Onboarding />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/home',
    element: <Home />,
  },
  {
    path: '/upload',
    element: <Upload />,
  },
  {
    path: '/loading',
    element: <Loading />,
  },
  {
    path: '/result',
    element: <ResultDashboard />,
  },
]);