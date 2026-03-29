const { query } = require('../config/db');

const getRoomsByUser = async (userId) => {
  const { rows } = await query(
    `SELECT id, name, width_cm, height_cm, photo_url, created_at
     FROM rooms WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

const getRoomById = async (id, userId) => {
  const { rows } = await query(
    `SELECT * FROM rooms WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return rows[0] || null;
};

const createRoom = async ({ userId, name, widthCm, heightCm, photoUrl }) => {
  const { rows } = await query(
    `INSERT INTO rooms (user_id, name, width_cm, height_cm, photo_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, name, widthCm, heightCm, photoUrl]
  );
  return rows[0];
};

const updateRoom = async (id, userId, fields) => {
  const allowed = ['name', 'width_cm', 'height_cm', 'photo_url'];
  const sets    = [];
  const params  = [];

  for (const [key, val] of Object.entries(fields)) {
    if (allowed.includes(key) && val !== undefined) {
      params.push(val);
      sets.push(`${key} = $${params.length}`);
    }
  }
  if (!sets.length) return null;

  params.push(id, userId);
  const { rows } = await query(
    `UPDATE rooms SET ${sets.join(', ')}
     WHERE id = $${params.length - 1} AND user_id = $${params.length}
     RETURNING *`,
    params
  );
  return rows[0] || null;
};

const deleteRoom = async (id, userId) => {
  const { rows } = await query(
    `DELETE FROM rooms WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return rows[0] || null;
};

module.exports = { getRoomsByUser, getRoomById, createRoom, updateRoom, deleteRoom };