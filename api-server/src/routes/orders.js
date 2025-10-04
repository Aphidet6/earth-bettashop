/**
 * Orders API
 * - POST /api/orders -> create order (customer)
 * - GET /api/orders -> list orders (admin sees all, customer sees own)
 * - GET /api/orders/:id -> view order (owner or admin)
 * - PUT /api/orders/:id -> update status (admin)
 * - DELETE /api/orders/:id -> cancel (customer/admin)
 *
 * Notes:
 * - This is a simplified example. Real order processing involves payment
 *   gateways, inventory transactions, webhooks, and idempotency.
 */

const express = require('express');
const router = express.Router();
const passport = require('passport');
const Joi = require('joi');
const { pool } = require('../lib/postgres');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create an order (customer)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: order created
 */
// Create order (customer)
const orderItemSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  qty: Joi.number().integer().min(1).required(),
  price: Joi.number().precision(2).min(0).required(),
});

const orderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  shipping: Joi.object().optional(),
  payment: Joi.object().optional(),
});

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  const user = req.user;
  const { error, value } = orderSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details.map(d => d.message).join(', ') });
  const { items, shipping, payment } = value;

  try {
    // In a real app: start a DB transaction, check inventory, create order and order_items
    const orderRes = await pool.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.id, 0, JSON.stringify(shipping || {}), 'created']
    );

    const order = orderRes.rows[0];

    // Insert order items
    for (const it of items) {
      await pool.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1,$2,$3,$4)', [order.id, it.product_id, it.qty, it.price]);
    }

    // Here we would calculate total_amount and update the order
    await pool.query('UPDATE orders SET total_amount = (SELECT COALESCE(SUM(quantity*price),0) FROM order_items WHERE order_id = $1) WHERE id = $1', [order.id]);

    return res.json({ success: true, data: { order_id: order.id } });
  } catch (err) {
    console.error('Create order error', err);
    return next(err);
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         product_id:
 *           type: integer
 *         qty:
 *           type: integer
 *         price:
 *           type: number
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         total_amount:
 *           type: number
 *         status:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: List orders (admin sees all, customer sees own)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: list of orders
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: List orders (admin sees all, customer sees own)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: list of orders
 */
// List orders: admin sees all, customer sees own
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const user = req.user;
  try {
    if (user.role === 'admin') {
      const r = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      return res.json({ success: true, data: r.rows });
    } else {
      const r = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [user.id]);
      return res.json({ success: true, data: r.rows });
    }
  } catch (err) {
    console.error('List orders error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// View order
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const user = req.user;
  try {
    const r = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    const order = r.rows[0];
    if (user.role !== 'admin' && order.user_id !== user.id) return res.status(403).json({ success: false, error: 'Forbidden' });
    // Fetch order items
    const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    order.items = items.rows;
    return res.json({ success: true, data: order });
  } catch (err) {
    console.error('View order error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update order status (admin)
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const user = req.user;
  if (user.role !== 'admin') return res.status(403).json({ success: false, error: 'Forbidden' });
  const { status } = req.body;
  try {
    const upd = await pool.query('UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [status, req.params.id]);
    if (upd.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: upd.rows[0] });
  } catch (err) {
    console.error('Update order error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Cancel order (customer can cancel their own order)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const user = req.user;
  try {
    const r = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    const order = r.rows[0];
    if (user.role !== 'admin' && order.user_id !== user.id) return res.status(403).json({ success: false, error: 'Forbidden' });
    await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete order error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
