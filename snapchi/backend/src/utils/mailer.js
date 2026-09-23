import { Resend } from 'resend';

// Gửi email, không ném lỗi: trả về true/false để luồng gọi vẫn trả kết quả chung chung cho client
export async function sendMail({ to, subject, html }) {
  try {
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });
    if (error) throw new Error(error.message);
    return true;
  } catch (err) {
    console.error('Gửi email thất bại:', err.message);
    return false;
  }
}
