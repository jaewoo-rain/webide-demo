import React from 'react';
import { useSelector } from 'react-redux';
import AuthView from '../components/auth/AuthView';
import ProjectListView from '../components/dashboard/ProjectListView';

export default function HomePage() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <>
      {isAuthenticated ? <ProjectListView /> : <AuthView />}
    </>
  );
}