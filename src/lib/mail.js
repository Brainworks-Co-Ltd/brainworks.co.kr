import emailjs from '@emailjs/browser';

const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const defaultRecipient = 'austin@brainworks.co.kr';

export async function sendContactMail(formData) {
  if (!serviceId || !templateId || !publicKey) {
    throw new Error('Missing EmailJS configuration');
  }

  const payload = {
    ...formData,
    to_email: defaultRecipient,
  };

  return emailjs.send(serviceId, templateId, payload, publicKey);
}
