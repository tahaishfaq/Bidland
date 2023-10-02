const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const nodemailer = require('nodemailer');

// ... existing code


const sendConfirmationEmail = (email) => {
  // Create a Nodemailer transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // SMTP server hostname
    port: 587,                 // Port for secure SMTP (e.g., 587 for TLS)
    secure: false,             // true for 465, false for other ports
    auth: {
      user: 'tahaishfaq71@@gmail.com',  // Your Gmail email
      pass: 'wyfk chkk hsjh upvr'  // SMTP password (or app password for Gmail)
    }
  });

  const mailOptions = {
    from: 'admin@gmail.com',
    to: email,
    subject: 'Account Confirmation',
    text: 'Thank you for registering. Please click the link to confirm your account.'
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending confirmation email:', error);
    } else {
      console.log('Confirmation email sent:', info.response);
    }
  });
};

const registerUser = async (req, res) => {
  const { username, email, password, role, phone } = req.body;

  try {
    // Check if the email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with the same email or username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role ,
      phone
    });

    await user.save();
    sendConfirmationEmail(email);

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Create a JWT token with an expiration time (24 hours in this example)
    const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, 'HelloWorld', {
      expiresIn: '24h'
    });

    // Calculate the expiration time (in milliseconds)
    const expiresInMilliseconds = 24 * 60 * 60 * 1000;

    res.json({ token, expiresIn: expiresInMilliseconds });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { registerUser, loginUser };

