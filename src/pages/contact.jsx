import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '@/components/Footer';
import { sendContactMail } from '@/lib/mail';

const createInitialFormState = () => ({
  name: '',
  email: '',
  company: '',
  subject: '',
  message: ''
});

export default function Contact() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState(createInitialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await sendContactMail(formData);
      setSubmitStatus('success');
      setFormData(createInitialFormState());
    } catch (error) {
      console.error('Error sending email:', error);
      if (error?.message === 'Missing EmailJS configuration') {
        setSubmitStatus('configError');
      } else {
        setSubmitStatus('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl mb-6 sm:mb-8">
            {language === 'ko' ? '문의하기' : 'Contact Us'}
          </h1>
          <p className="text-base text-gray-600 sm:text-lg max-w-2xl">
            {language === 'ko'
              ? 'AI 솔루션 협업, 교육 관련 협의, 사업 문의를 원하시는 경우 아래 양식을 작성해 주세요.'
              : 'Please fill out the form below for any inquiries about our AI solutions.'}
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ko' ? '이름' : 'Name'}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ko' ? '이메일' : 'Email'}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ko' ? '회사명' : 'Company'}
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ko' ? '제목' : 'Subject'}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ko' ? '문의내용' : 'Message'}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting
                    ? (language === 'ko' ? '전송 중...' : 'Sending...')
                    : (language === 'ko' ? '문의하기' : 'Send Message')}
                </button>
              </div>

              {submitStatus === 'success' && (
                <div className="p-4 bg-green-100 text-green-700 rounded-md">
                  {language === 'ko'
                    ? '문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변 드리겠습니다.'
                    : 'Your inquiry has been sent successfully. We will get back to you soon.'}
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                  {language === 'ko'
                    ? '문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.'
                    : 'An error occurred while sending your inquiry. Please try again.'}
                </div>
              )}

              {submitStatus === 'configError' && (
                <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
                  {language === 'ko'
                    ? '이메일 전송 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.'
                    : 'Email delivery is not configured. Please contact the site administrator.'}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 
