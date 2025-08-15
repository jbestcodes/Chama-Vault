const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jbest.collections@gmail.com',
    pass: 'prdu jsfw jutu uhcu'
  }
});

router.post('/', async (req, res) => {
  const { full_name, phone, group_name, message } = req.body;
  if (!full_name || !phone || !group_name || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    await transporter.sendMail({
      from: '"Chama Vault Contact" <jbest.collections@gmail.com>',
      to: 'jbest.collections@gmail.com',
      subject: 'New Contact Us Message',
      text: `
Full Name: ${full_name}
Phone: ${phone}
Group Name: ${group_name}

Message:
${message}
      `
    });
    res.json({ message: 'Message sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

module.exports = router;