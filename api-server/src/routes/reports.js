const express = require('express');
const router = express.Router();
const passport = require('passport');
const { pool } = require('../lib/postgres');

// GET /api/reports/sales?seller_id=&from=&to=
router.get('/sales', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const user = req.user;
  const { from, to } = req.query;

  // Only sellers and admins can access
  if (!['seller','admin'].includes(user.role)) return res.status(403).json({ success: false, error: 'Forbidden' });

  try {
    // If seller, restrict to their products
    const sellerCondition = user.role === 'seller' ? 'p.owner_id = $1 AND' : '';
    const params = user.role === 'seller' ? [user.id] : [];

    const dateFilter = (from || to) ? `AND o.created_at BETWEEN COALESCE(NULLIF($${params.length+1},''), '-infinity') AND COALESCE(NULLIF($${params.length+2},''), 'infinity')` : '';
    if (from || to) params.push(from || '', to || '');

    const sql = `SELECT p.id as product_id, p.name, SUM(oi.quantity) as qty_sold, SUM(oi.quantity*oi.price) as revenue FROM order_items oi JOIN orders o ON oi.order_id = o.id JOIN products p ON oi.product_id = p.id WHERE ${sellerCondition} 1=1 ${dateFilter} GROUP BY p.id, p.name ORDER BY revenue DESC`;
    const r = await pool.query(sql, params);
    return res.json({ success: true, data: r.rows });
  } catch (err) {
    console.error('Sales report error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
