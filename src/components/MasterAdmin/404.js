// src/components/NotFoundPage.js

import React from 'react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-200 to-black-300">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <motion.div
          className="text-8xl font-bold text-red-600 mb-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          404
        </motion.div>
        <motion.h1
          className="text-4xl font-extrabold text-gray-800 mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Something Went Wrong
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Oops! It looks like the page you are looking for doesn't exist or something went wrong.
        </motion.p>
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <p className="text-lg text-gray-700 mb-4">
            For account activation or further assistance, please contact the superadmin.
          </p>
         
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
