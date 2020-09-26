import axios from 'axios';
import qs from 'qs';

export const kakaoLogin = (ctx) => {
  //TODO: host util화 시키기
  const host =
    process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_API_HOST
      : 'http://localhost:4000';
  const { KAKAO_REST_API_KEY } = process.env;

  const REDIRECT_URI = `${host}/api/v1/auth/social/callback/kakao`;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;

  ctx.redirect(kakaoAuthUrl);
};

export const kakaoCallback = async (ctx) => {
  const { code: authorizeCode } = ctx.query;
  const { KAKAO_REST_API_KEY } = process.env;
  const host =
    process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_API_HOST
      : 'http://localhost:4000';

  const REDIRECT_URI = `${host}/api/v1/auth/social/callback/kakao`;

  const kakaoTokenResponse = await axios({
    method: 'POST',
    url: 'https://kauth.kakao.com/oauth/token',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify({
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: REDIRECT_URI,
      code: authorizeCode,
    }),
  });

  const { access_token } = kakaoTokenResponse.data;

  const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const {
    nickname: username,
    profile_image: profile,
  } = userResponse.data.properties;

  //TODO:로그인 처리 or 회원가입
  ctx.body = { username, profile };
};
