import nodeMailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';

import loadVariable from '../loadVariable';
import { getAppHost } from './utils';

loadVariable();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

const defaultEmailParams = {
  to: 'clroot@kakao.com',
  title: '(제목없음)',
  body: '(내용없음)',
  from: '"pocket" <no-reply@clroot.io>',
};

const mailTransporter = nodeMailer.createTransport(
  smtpTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '25'),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  }),
);

export const createAuthEmail = (emailAuthToken: string) => {
  const host = getAppHost();
  const title = `Pocket에 오신 것을 환영합니다! `;
  const body = `
    <a href="${host}">
      <img src="${host}/images/logo-full.png" style="display: block; width: 128px; margin: 0 auto;"/>
    </a>
    <div style="max-width: 400px; width: 100%; margin: 0 auto; padding: 1rem; text-align: justify; background: #f8f9fa; border: 1px solid #dee2e6; box-sizing: border-box; border-radius: 4px; color: #868e96; margin-top: 0.5rem; box-sizing: border-box;">
      <b style="black">안녕하세요! </b>Pocket에 오신 것을 환영합니다! 시작하기 전에, 아래 링크를 클릭하여 이메일 주소를 확인하십시오. Pocket에 가입하지 않았으면 이 메시지를 무시하십시오.
    </div>
    <a href="${host}/?emailVerify=${emailAuthToken}" style="text-decoration: none; max-width: 400px; width: 100%; text-align:center; display:block; margin: 0 auto; margin-top: 1rem; background: #343a40; padding-top: 1rem; color: white; font-size: 1.25rem; padding-bottom: 1rem; font-weight: 600; border-radius: 4px;">계속하기</a>
  `;

  return { title, body };
};

export const sendEmail = async (
  payload = { ...defaultEmailParams },
  callback?: Function,
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
    return callback ? callback(error, undefined) : { status: false, error };
  }

  return callback ? callback(undefined, { status: true }) : { status: true };
};
