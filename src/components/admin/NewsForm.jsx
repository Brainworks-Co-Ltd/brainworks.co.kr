import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function NewsForm() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    title: { ko: '', en: '' },
    content: { ko: '', en: '' },
    imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          author: session.user.id
        }),
      });

      if (!response.ok) {
        throw new Error('뉴스 작성에 실패했습니다.');
      }

      // 폼 초기화
      setFormData({
        title: { ko: '', en: '' },
        content: { ko: '', en: '' },
        imageUrl: ''
      });

      alert('뉴스가 성공적으로 작성되었습니다.');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [field, lang] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">한글 제목</label>
        <input
          type="text"
          name="title.ko"
          value={formData.title.ko}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">영문 제목</label>
        <input
          type="text"
          name="title.en"
          value={formData.title.en}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">한글 내용</label>
        <textarea
          name="content.ko"
          value={formData.content.ko}
          onChange={handleChange}
          rows="4"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">영문 내용</label>
        <textarea
          name="content.en"
          value={formData.content.en}
          onChange={handleChange}
          rows="4"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">이미지 URL</label>
        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isSubmitting ? '작성 중...' : '뉴스 작성'}
      </button>
    </form>
  );
} 