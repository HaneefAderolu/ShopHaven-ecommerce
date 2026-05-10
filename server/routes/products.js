const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    let result;
    if (category && category !== 'All') {
      result = await db.query(
        'SELECT * FROM products WHERE LOWER(category) = LOWER($1)',
        [category]
      );
    } else {
      result = await db.query('SELECT * FROM products');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products WHERE id=$1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;