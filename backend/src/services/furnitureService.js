const { query } = require('../config/db');

const getCategories = async () => {
  const { rows } = await query(
    'SELECT id, name, icon FROM furniture_categories ORDER BY id'
  );
  return rows;
};

const getFurnitures = async ({ categoryId, search }) => {
  let sql = `
    SELECT f.id, f.name, f.width_cm, f.depth_cm, f.height_cm,
           f.thumbnail_url, c.name AS category_name
    FROM   furnitures f
    JOIN   furniture_categories c ON c.id = f.category_id
    WHERE  f.is_default = TRUE
  `;
  const params = [];

  if (categoryId) {
    params.push(categoryId);
    sql += ` AND f.category_id = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    sql += ` AND f.name ILIKE $${params.length}`;
  }

  sql += ' ORDER BY c.id, f.name';

  const { rows } = await query(sql, params);
  return rows;
};

const getFurnitureById = async (id) => {
  const { rows } = await query(
    `SELECT f.*, c.name AS category_name
     FROM furnitures f
     JOIN furniture_categories c ON c.id = f.category_id
     WHERE f.id = $1`,
    [id]
  );
  return rows[0] || null;
};

module.exports = { getCategories, getFurnitures, getFurnitureById };