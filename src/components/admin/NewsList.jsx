import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function NewsList() {
  const { data: session } = useSession();
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error('뉴스 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 뉴스를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('뉴스 삭제에 실패했습니다.');
      }

      setNews(news.filter(item => item._id !== id));
      alert('뉴스가 성공적으로 삭제되었습니다.');
    } catch (error) {
      alert(error.message);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {news.map((item) => (
        <div key={item._id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{item.title.ko}</h3>
              <p className="text-sm text-gray-500">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(item._id)}
              className="text-red-600 hover:text-red-800"
            >
              삭제
            </button>
          </div>
          <p className="mt-2 text-gray-600 line-clamp-2">{item.content.ko}</p>
        </div>
      ))}
    </div>
  );
} 