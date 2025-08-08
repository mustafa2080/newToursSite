import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <LoadingSpinner size="large" color="blue" text="Loading..." />
      </div>
    );
  }

  return (
    <>
      <Header />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 w-full"
      >
        <Outlet />
      </motion.main>

      <Footer />
    </>
  );
};

export default Layout;
