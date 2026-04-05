
const Joi = require('joi');

// 비밀번호 정규식: 영문 + 숫자 + 특수문자 각 1개 이상, 8자리 이상
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const schemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email':   '올바른 이메일 형식이 아닙니다.',
      'any.required':   '이메일은 필수입니다.',
    }),
    password: Joi.string().pattern(passwordRegex).required().messages({
      'string.pattern.base': '비밀번호는 영문, 숫자, 특수문자를 포함한 8자리 이상이어야 합니다.',
      'any.required':        '비밀번호는 필수입니다.',
    }),
    nickname: Joi.string().min(2).max(20).required().messages({
      'string.min':   '닉네임은 2자 이상이어야 합니다.',
      'string.max':   '닉네임은 20자 이하여야 합니다.',
      'any.required': '닉네임은 필수입니다.',
    }),
  }),

  login: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const validate = (schemaName) => (req, res, next) => {
  const { error } = schemas[schemaName].validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map(d => d.message);
    return res.status(400).json({ message: '입력값 오류', errors: messages });
  }
  next();
};

module.exports = validate;