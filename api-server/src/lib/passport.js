/*
  Passport setup file.
  - Local strategy: validate username/password against Postgres users table
  - JWT strategy: validate requests that carry JWT in Authorization header

  Note: For brevity this example uses simple SQL queries. In production,
  use parameterized queries, proper hashing (bcrypt) and a user service layer.
*/

const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcryptjs');
const { pool } = require('./postgres');

module.exports = function (passport) {
  // Local strategy for username/password login
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      // Find user in Postgres
      const res = await pool.query('SELECT id, username, password_hash, role FROM users WHERE username = $1', [username]);
      if (res.rows.length === 0) return done(null, false, { message: 'Incorrect username.' });

      const user = res.rows[0];

      // Compare password hash
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return done(null, false, { message: 'Incorrect password.' });

      // Exclude password_hash in returned user object
      delete user.password_hash;
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // JWT strategy for protected routes
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'secret',
  };

  passport.use(new JwtStrategy(opts, async (payload, done) => {
    try {
      // payload should contain user id and role
      const res = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [payload.sub]);
      if (res.rows.length === 0) return done(null, false);
      return done(null, res.rows[0]);
    } catch (err) {
      return done(err, false);
    }
  }));

  // Helper to find or create user by provider id
  async function findOrCreateProviderUser(provider, providerId, profile) {
    // 1) Try to find by provider mapping in users_oauth
    try {
      const mapRes = await pool.query('SELECT u.id, u.username, u.role FROM users_oauth o JOIN users u ON o.user_id = u.id WHERE o.provider = $1 AND o.provider_id = $2', [provider, providerId]);
      if (mapRes.rows.length) return mapRes.rows[0];

      // 2) Try to match by email if available
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || null;
      if (email) {
        const existing = await pool.query('SELECT id, username, role FROM users WHERE username = $1', [email]);
        if (existing.rows.length) {
          const user = existing.rows[0];
          // Insert mapping to users_oauth for future logins (ignore unique violation)
          try {
            await pool.query('INSERT INTO users_oauth (user_id, provider, provider_id) VALUES ($1, $2, $3)', [user.id, provider, providerId]);
          } catch (e) {
            // ignore unique constraint errors and continue
            // console.warn('users_oauth insert ignored', e.message);
          }
          return user;
        }
      }

      // 3) Create a new user and mapping
      const username = email || `${provider}:${providerId}`;
      const role = 'customer';
      // Insert user and mapping in a transaction to avoid partial state
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const insert = await client.query('INSERT INTO users (username, role) VALUES ($1, $2) RETURNING id, username, role', [username, role]);
        const newUser = insert.rows[0];
        try {
          await client.query('INSERT INTO users_oauth (user_id, provider, provider_id) VALUES ($1, $2, $3)', [newUser.id, provider, providerId]);
        } catch (e) {
          // If mapping insert fails for uniqueness reasons, that's okay
        }
        await client.query('COMMIT');
        return newUser;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      // Bubble up DB errors
      throw err;
    }
  }

  // Google OAuth
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateProviderUser('google', profile.id, profile);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));
  }

  // GitHub OAuth
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
      scope: [ 'user:email' ]
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateProviderUser('github', profile.id, profile);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));
  }
};
