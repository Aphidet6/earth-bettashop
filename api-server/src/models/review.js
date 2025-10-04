/**
 * Review model (MongoDB) - good fit for flexible review schema
 * Fields can be extended without migrations.
 */

const { mongoose } = require('../lib/mongo');

const ReviewSchema = new mongoose.Schema({
  productId: { type: Number, required: true }, // reference to Postgres product id
  userId: { type: Number, required: false },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: String,
  body: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
