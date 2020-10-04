import nodeMailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';

import loadVariable from '../loadVariable';
loadVariable();

const defaultEmailParams = {
  to: 'clroot@kakao.com',
  title: '(제목없음)',
  body: '(내용없음)',
  from: '"pocket" <no-reply@clroot.io>',
};

const mailTransporter = nodeMailer.createTransport(
  smtpTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  }),
);

export const sendEmail = async (
  payload = { ...defaultEmailParams },
  callback = undefined,
) => {
  const { to, title, body, from } = { ...defaultEmailParams, ...payload };

  try {
    await mailTransporter.sendMail({
      to,
      from,
      subject: title,
      html: body,
    });
  } catch (error) {
    console.error(error);
    return callback
      ? callback(error, undefined)
      : Promise.reject({ status: false, error });
  }

  return callback
    ? callback(undefined, { status: true })
    : Promise.resolve({ status: true });
};
