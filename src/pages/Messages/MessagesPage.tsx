
import React from 'react';
import Layout from '@/components/layout/Layout';
import RealTimeMessageCenter from '@/components/messaging/RealTimeMessageCenter';
import RequireAuth from '@/components/auth/RequireAuth';

const MessagesPage = () => {
  return (
    <RequireAuth>
      <Layout>
        <div className="container mx-auto px-0 md:px-4 py-6">
          <div className="bg-white rounded-lg shadow">
            <RealTimeMessageCenter />
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
};

export default MessagesPage;
