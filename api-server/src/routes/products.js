/**
 * Products API
 * - GET /api/products -> list + search + filters
 * - POST /api/products -> create (requires seller/admin)
 * - GET /api/products/:id -> detail
 * - PUT /api/products/:id -> update (requires seller/admin)
 * - DELETE /api/products/:id -> delete (requires seller/admin)
 *
 * This file uses Postgres for product storage. Authorization checks are
 * demonstrated using passport.authenticate for JWT and a simple role check.
 */

const express = require('express');
const router = express.Router();
const passport = require('passport');
const Joi = require('joi');
const { pool } = require('../lib/postgres');

// Helper: permit based on role
function permit(...allowed) {
  return (req, res, next) => {
    const user = req.user; // set by passport-jwt
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (allowed.includes(user.role) || user.role === 'admin') return next();
    return res.status(403).json({ success: false, error: 'Forbidden' });
  };
}

// Validation schema for create/update product
const productSchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().allow(null, ''),
  price: Joi.number().precision(2).min(0).required(),
  stock_quantity: Joi.number().integer().min(0).required(),
  category_id: Joi.number().integer().allow(null),
  image_url: Joi.string().uri().allow(null, ''),
  is_active: Joi.boolean().default(true),
});

/**
 * GET /api/products
 * Query params:
 * - q: search text (name, description)
 * - category: category id
 * - minPrice, maxPrice
 * - page, limit
 */
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List products with optional search and filters
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Text search on name and description
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Category id
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *     responses:
 *       200:
 *         description: A list of products
 */
router.get('/', async (req, res) => {
  const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  // Build a simple SQL query with filters
  let base = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
  const conditions = [];
  const params = [];

  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }
  if (category) {
    params.push(category);
    conditions.push(`p.category_id = $${params.length}`);
  }
  if (minPrice) {
    params.push(minPrice);
    conditions.push(`p.price >= $${params.length}`);
  }
  if (maxPrice) {
    params.push(maxPrice);
    conditions.push(`p.price <= $${params.length}`);
  }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const pagination = ` ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  try {
    const qres = await pool.query(base + where + pagination, params);
    const items = qres.rows.map(r => ({ ...r, category: { id: r.category_id, name: r.category_name } }));
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('Products list error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock_quantity:
 *           type: integer
 *         category:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         image_url:
 *           type: string
 *         is_active:
 *           type: boolean
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product (seller or admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 */

// Create product (seller or admin)
router.post('/', passport.authenticate('jwt', { session: false }), permit('seller'), async (req, res) => {
  // Validate input
  const { error, value } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details.map(d => d.message).join(', ') });

  const { name, description, price, stock_quantity, category_id, image_url, is_active } = value;
  // In a multi-seller system, link product to req.user.id (owner_id)
  const ownerId = req.user.id;

  try {
    const insert = await pool.query(
      `INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, is_active, owner_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, description, price, stock_quantity, category_id, image_url, is_active, ownerId]
    );
    return res.json({ success: true, data: insert.rows[0] });
  } catch (err) {
    console.error('Create product error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: product detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 */

// Get product detail
router.get('/:id', async (req, res) => {
  try {
    const qres = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1', [req.params.id]);
    if (qres.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    const r = qres.rows[0];
    r.category = { id: r.category_id, name: r.category_name };
    return res.json({ success: true, data: r });
  } catch (err) {
    console.error('Product detail error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: product updated
 */

// Update product (seller or admin) - sellers can only update their own products
router.put('/:id', passport.authenticate('jwt', { session: false }), permit('seller'), async (req, res) => {
  const { error, value } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details.map(d => d.message).join(', ') });

  try {
    // Ownership check: if seller, ensure they own the product
    const productRes = await pool.query('SELECT owner_id FROM products WHERE id = $1', [req.params.id]);
    if (productRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    const ownerId = productRes.rows[0].owner_id;
    if (req.user.role !== 'admin' && ownerId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

    const { name, description, price, stock_quantity, category_id, image_url, is_active } = value;
    const upd = await pool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, stock_quantity=$4, category_id=$5, image_url=$6, is_active=$7, updated_at=NOW() WHERE id=$8 RETURNING *`,
      [name, description, price, stock_quantity, category_id, image_url, is_active, req.params.id]
    );
    return res.json({ success: true, data: upd.rows[0] });
  } catch (err) {
    console.error('Product update error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: deleted
 */

// Delete product
router.delete('/:id', passport.authenticate('jwt', { session: false }), permit('seller'), async (req, res) => {
  try {
    // Ownership check
    const productRes = await pool.query('SELECT owner_id FROM products WHERE id = $1', [req.params.id]);
    if (productRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    const ownerId = productRes.rows[0].owner_id;
    if (req.user.role !== 'admin' && ownerId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Product delete error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
