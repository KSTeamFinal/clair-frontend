import { createBrowserRouter } from 'react-router-dom';
import { StartScreen } from './screens/StartScreen';
import { Onboarding } from './screens/Onboarding';
import { Login } from './screens/Login';
import { SignUp } from './screens/SignUp';
import { Home } from './screens/Home';
import { Upload } from './screens/Upload';
import { Loading } from './screens/Loading';
import { ResultDashboard } from './screens/ResultDashboard';
import NotificationScreen from './screens/NotificationScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatSessionScreen from './screens/ChatSessionScreen';
import ContractManagementScreen from './screens/ContractManagementScreen';
import { PasswordReset } from './screens/PasswordReset';
import SharePage from './screens/SharePage';
import { SocialCallback } from './screens/SocialCallback';

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
    path: '/loading/:contractId',
    element: <Loading />,
  },
  {
    path: '/result/:contractId',
    element: <ResultDashboard />,
  },
  {
    path: '/notifications',
    element: <NotificationScreen />
  },
  {
    path: '/settings',
    element: <SettingsScreen />
  },
  {
    path: '/profile',
    element: <ProfileScreen />
  },
  
  {
  path: '/chat-session',
  element: <ChatSessionScreen />
  },

  {
    path: '/contracts/manage',
    element: <ContractManagementScreen />

  },

  {
  path: '/password-reset',
  element: <PasswordReset />,
  },


{
  path: '/share/:token',
  element: <SharePage />,
},
{
  path: '/social-callback',
  element: <SocialCallback />,
},



]);