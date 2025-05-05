
import React from 'react';
import Layout from '@/components/layout/Layout';
import MessageCenter from '@/components/messaging/MessageCenter';

const MessagesPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-0 md:px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          <MessageCenter />
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
