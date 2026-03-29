module.exports = (err, req, res, next) => {
  console.error(err.stack);

  const status  = err.status  || 500;
  const message = err.message || '서버 오류가 발생했습니다.';

  res.status(status).json({ message });
};