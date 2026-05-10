const router  = require('express').Router();
const db      = require('../db');
const auth    = require('../middleware/auth');

// Place an order
router.post('/', auth, async (req, res) => {
  const { items } = req.body;
  if (!items || items.length === 0)
    return res.status(400).json({ error: 'No items in order' });

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  try {
    const order = await db.query(
      'INSERT INTO orders (user_id, total) VALUES ($1,$2) RETURNING id',
      [req.user.id, total]
    );
    const orderId = order.rows[0].id;

    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
    res.json({ message: 'Order placed', orderId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get user's orders WITH item details
router.get('/mine', auth, async (req, res) => {
  try {
    // Fetch all orders
    const ordersResult = await db.query(
      'SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    );
    const orders = ordersResult.rows;

    // For each order, fetch its items joined with product info
    for (const order of orders) {
      const itemsResult = await db.query(
        `SELECT oi.*, p.name, p.image_url, p.category
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;