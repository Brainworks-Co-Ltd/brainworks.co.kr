import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    ko: String,
    en: String
  },
  content: {
    ko: String,
    en: String
  },
  imageUrl: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.News || mongoose.model('News', newsSchema); 