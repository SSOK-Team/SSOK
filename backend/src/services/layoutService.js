const { pool, query } = require('../config/db');

const getLayoutsByRoom = async (roomId, userId) => {
  const { rows: roomCheck } = await query(
    'SELECT id FROM rooms WHERE id = $1 AND user_id = $2',
    [roomId, userId]
  );
  if (!roomCheck.length) return null;

  const { rows } = await query(
    `SELECT id, title, saved_at FROM room_layouts
     WHERE room_id = $1 ORDER BY saved_at DESC`,
    [roomId]
  );
  return rows;
};

const getLayoutWithItems = async (layoutId, userId) => {
  const { rows: layout } = await query(
    `SELECT rl.* FROM room_layouts rl
     JOIN rooms r ON r.id = rl.room_id
     WHERE rl.id = $1 AND r.user_id = $2`,
    [layoutId, userId]
  );
  if (!layout.length) return null;

  const { rows: items } = await query(
    `SELECT li.id, li.pos_x, li.pos_y, li.scale, li.rotation_deg,
            f.id AS furniture_id, f.name, f.width_cm, f.depth_cm,
            f.thumbnail_url
     FROM layout_items li
     JOIN furnitures f ON f.id = li.furniture_id
     WHERE li.layout_id = $1`,
    [layoutId]
  );

  return { ...layout[0], items };
};

const saveLayout = async ({ roomId, userId, title, items }) => {
  const { rows: roomCheck } = await query(
    'SELECT id FROM rooms WHERE id = $1 AND user_id = $2',
    [roomId, userId]
  );
  if (!roomCheck.length) return null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: layout } = await client.query(
      `INSERT INTO room_layouts (room_id, title)
       VALUES ($1, $2) RETURNING *`,
      [roomId, title || '새 배치']
    );
    const layoutId = layout[0].id;

    for (const item of items) {
      await client.query(
        `INSERT INTO layout_items
           (layout_id, furniture_id, pos_x, pos_y, scale, rotation_deg)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          layoutId,
          item.furniture_id,
          item.pos_x,
          item.pos_y,
          item.scale        ?? 1.0,
          item.rotation_deg ?? 0,
        ]
      );
    }

    await client.query('COMMIT');
    return { ...layout[0], items };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const deleteLayout = async (layoutId, userId) => {
  const { rows } = await query(
    `DELETE FROM room_layouts rl
     USING rooms r
     WHERE rl.room_id = r.id
       AND rl.id = $1 AND r.user_id = $2
     RETURNING rl.id`,
    [layoutId, userId]
  );
  return rows[0] || null;
};

module.exports = { getLayoutsByRoom, getLayoutWithItems, saveLayout, deleteLayout };