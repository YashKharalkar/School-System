const SmsModel = require('../models/smsModel');

const smsController = {
  // POST /api/sms/send
  async send(req, res) {
    try {
      const { class: cls, section, recipients, message } = req.body;
      if (!message || !message.trim()) return res.status(400).json({ success: false, message: 'Message is required.' });
      if (!recipients || recipients.length === 0) return res.status(400).json({ success: false, message: 'Select at least one recipient.' });

      const recipientStr = Array.isArray(recipients) ? recipients.join(',') : recipients;
      const smsId = await SmsModel.create({
        sent_by: req.user.id,
        class: cls,
        section,
        recipients: recipientStr,
        message: message.trim()
      });

      res.status(201).json({ success: true, message: `SMS saved successfully to ${Array.isArray(recipients) ? recipients.length : 1} recipients.`, id: smsId });
    } catch (error) {
      console.error('Send SMS error:', error);
      res.status(500).json({ success: false, message: 'Failed to send SMS.' });
    }
  },

  // GET /api/sms/history
  async history(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await SmsModel.getAll({ page: Number(page), limit: Number(limit) });
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('SMS history error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch SMS history.' });
    }
  }
};

module.exports = smsController;
