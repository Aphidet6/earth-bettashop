/**
 * Auth routes
 * - POST /api/auth/register -> create user (hash password, store in Postgres)
 * - POST /api/auth/login -> validate credentials, return JWT
 *
 * Comments explain purpose and where to extend (OAuth, rate-limiting, account lockout)
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { pool } = require('../lib/postgres');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');

// Register a new user
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, seller, customer]
 *           example:
 *             username: user@example.com
 *             password: secret123
 *             role: customer
 *     responses:
 *       200:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
// Validate register input using Joi
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('admin', 'seller', 'customer').default('customer'),
});

router.post('/register', async (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details.map(d => d.message).join(', ') });

  const { username, password, role } = value;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)', [username, hash, role]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Register error', err);
    return next(err);
  }
});

// Login using local strategy
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             username: user@example.com
 *             password: secret123
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
// Protect the login endpoint with a rate limiter to avoid brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, (req, res, next) => {
  // Passport local strategy validates username/password and returns user object
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, error: info?.message || 'Unauthorized' });

    // Issue JWT (sub = user id)
    const payload = { sub: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });

    return res.json({ success: true, data: { token } });
  })(req, res, next);
});

// Helper to issue JWT for a user object
function issueTokenForUser(user) {
  const payload = { sub: user.id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });
}

// OAuth: Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');

    const token = issueTokenForUser(user);
    // If client requests JSON (e.g., ?json=1) return token, otherwise redirect to front-end with token
    if (req.query.json === '1') return res.json({ success: true, data: { token } });
    const redirectTo = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${redirectTo}/?token=${token}`);
  })(req, res, next);
});

// OAuth: GitHub
router.get('/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');

    const token = issueTokenForUser(user);
    if (req.query.json === '1') return res.json({ success: true, data: { token } });
    const redirectTo = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${redirectTo}/?token=${token}`);
  })(req, res, next);
});

// Example protected endpoint to fetch current user info
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 */
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  // req.user is populated by passport-jwt strategy
  res.json({ success: true, data: req.user });
});

module.exports = router;
