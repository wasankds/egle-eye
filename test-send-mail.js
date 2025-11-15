import nodemailer from 'nodemailer';

const EMAIL_WHOSEND = process.env.EMAIL_WHOSEND || 'wasankds@gmail.com';
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD || 'czes ztev jwkf itze';

async function sendTestMail() {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_WHOSEND,
        pass: EMAIL_APP_PASSWORD,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const mailOptions = {
      from: `"Test NodeMailer" <${EMAIL_WHOSEND}>`,
      to: EMAIL_WHOSEND,
      subject: 'Test Email from Node.js',
      html: '<h1>This is a test email from Node.js</h1><p>If you see this, SMTP works!</p>',
    };

    console.log('Sending mail...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Mail sent:', info);
  } catch (err) {
    console.error('Error sending mail:', err);
  }
}

sendTestMail();
