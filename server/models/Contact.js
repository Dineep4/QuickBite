const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

ContactSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Contact', ContactSchema);
