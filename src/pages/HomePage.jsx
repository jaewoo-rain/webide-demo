import React from 'react';
import { useSelector } from 'react-redux';
import Header from '../components/home/Header';
import Main from '../components/home/Main';
import LoginPage from './LoginPage';


export default function HomePage() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <>
      {isAuthenticated ?
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
          <Header />
          <Main />
        </div>
        : <LoginPage />
      }

    </>
  );
}