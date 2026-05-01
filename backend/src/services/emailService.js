// src/services/emailService.js
const nodemailer = require('nodemailer');

// Gmail 기준 설정 (다른 SMTP도 동일 구조)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,
    // window 오류 해결(1)
  tls: {
    // Windows에서 보안 인증서 검증을 통과하지 못할 때 
    // 오류를 발생시키지 않고 연결을 허용합니다.
    rejectUnauthorized: false
  }
});

// 인증 메일 발송
async function sendVerificationEmail(toEmail, verificationUrl) {
  const mailOptions = {
    from: `"AR 가구 배치" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '[AR 가구 배치] 이메일 인증을 완료해주세요',
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:sans-serif;border:1px solid #eee;border-radius:12px;overflow:hidden;">
        <div style="background:#4F46E5;padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">📐 AR 가구 배치</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#111;font-size:18px;">이메일 인증</h2>
          <p style="color:#555;line-height:1.6;">
            가입해 주셔서 감사합니다!<br/>
            아래 버튼을 클릭하면 이메일 인증이 완료됩니다.
          </p>
          <a href="${verificationUrl}"
             style="display:inline-block;margin:24px 0;padding:14px 32px;
                    background:#4F46E5;color:#fff;border-radius:8px;
                    text-decoration:none;font-weight:bold;font-size:15px;">
            이메일 인증하기
          </a>
          <p style="color:#999;font-size:13px;">
            ⏰ 이 링크는 <strong>24시간</strong> 후 만료됩니다.<br/>
            본인이 요청하지 않았다면 이 메일을 무시하세요.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
          <p style="color:#bbb;font-size:12px;">
            링크가 작동하지 않으면 아래 URL을 복사해 브라우저에 붙여넣으세요:<br/>
            <span style="color:#4F46E5;">${verificationUrl}</span>
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };