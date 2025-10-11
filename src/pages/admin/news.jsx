import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import NewsForm from '@/components/admin/NewsForm';
import NewsList from '@/components/admin/NewsList';

export default function NewsAdmin() {
  const sessionInfo = useSession();
  const session = sessionInfo?.data;
  const status = sessionInfo?.status ?? 'loading';
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
      return;
    }

    if (!session?.user?.isAdmin) {
      router.replace('/');
      return;
    }

    setIsLoading(false);
  }, [status, session, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">뉴스 관리</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">새 뉴스 작성</h2>
          <NewsForm />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">뉴스 목록</h2>
          <NewsList />
        </div>
      </div>
    </div>
  );
} 
