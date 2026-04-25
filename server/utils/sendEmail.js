import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

// ─────────────────────────────────────────────
// Generic send function
// ─────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: `"StudySpace" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    })
}

// ─────────────────────────────────────────────
// Welcome email — sent after registration
// ─────────────────────────────────────────────
export const sendWelcomeEmail = async (email, name) => {
    await sendEmail({
        to: email,
        subject: `Welcome to StudySpace, ${name}! 🎓`,
        html: `
      <div style="
        font-family: 'Segoe UI', sans-serif;
        max-width: 560px;
        margin: auto;
        background: #EEF2FF;
        border-radius: 16px;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="
          background: #3730A3;
          padding: 32px;
          text-align: center;
        ">
          <h1 style="
            color: #ffffff;
            font-size: 28px;
            margin: 0;
            letter-spacing: -0.5px;
          ">
            Study<span style="color: #6EE7B7;">·</span>Space
          </h1>
        </div>

        <!-- Body -->
        <div style="padding: 36px 32px;">
          <h2 style="
            color: #1E1B4B;
            font-size: 22px;
            margin-bottom: 12px;
          ">
            Welcome aboard, ${name}! 🎉
          </h2>

          <p style="
            color: #5B5EA6;
            font-size: 15px;
            line-height: 1.7;
            margin-bottom: 24px;
          ">
            You have successfully joined StudySpace.
            Start exploring courses and level up your
            knowledge today.
          </p>

          <!-- Button -->
          
            href="${process.env.CLIENT_URL}/courses"
            style="
              display: inline-block;
              background: #3730A3;
              color: #ffffff;
              padding: 14px 32px;
              border-radius: 12px;
              text-decoration: none;
              font-weight: 700;
              font-size: 15px;
              margin-bottom: 24px;
            "
          >
            Browse Courses →
          </a>

          <p style="
            color: #5B5EA6;
            font-size: 13px;
            line-height: 1.6;
          ">
            If you did not create this account,
            please ignore this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="
          background: #C7D2FE;
          padding: 16px 32px;
          text-align: center;
        ">
          <p style="
            color: #3730A3;
            font-size: 12px;
            margin: 0;
          ">
            © 2026 StudySpace. All rights reserved.
          </p>
        </div>
      </div>
    `,
    })
}

// ─────────────────────────────────────────────
// Course enrollment confirmation email
// ─────────────────────────────────────────────
export const sendEnrollmentEmail = async (email, name, courseName) => {
    await sendEmail({
        to: email,
        subject: `You are enrolled in ${courseName}! 🚀`,
        html: `
      <div style="
        font-family: 'Segoe UI', sans-serif;
        max-width: 560px;
        margin: auto;
        background: #EEF2FF;
        border-radius: 16px;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="
          background: #3730A3;
          padding: 32px;
          text-align: center;
        ">
          <h1 style="
            color: #ffffff;
            font-size: 28px;
            margin: 0;
          ">
            Study<span style="color: #6EE7B7;">·</span>Space
          </h1>
        </div>

        <!-- Body -->
        <div style="padding: 36px 32px;">
          <h2 style="
            color: #1E1B4B;
            font-size: 22px;
            margin-bottom: 12px;
          ">
            Enrollment Confirmed! 🎓
          </h2>

          <p style="
            color: #5B5EA6;
            font-size: 15px;
            line-height: 1.7;
            margin-bottom: 8px;
          ">
            Hi ${name}, you are now enrolled in:
          </p>

          <!-- Course name box -->
          <div style="
            background: #ffffff;
            border: 2px solid #C7D2FE;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
          ">
            <p style="
              color: #3730A3;
              font-size: 17px;
              font-weight: 700;
              margin: 0;
            ">
              ${courseName}
            </p>
          </div>

          <!-- Button -->
          
            href="${process.env.CLIENT_URL}/dashboard/student"
            style="
              display: inline-block;
              background: #059669;
              color: #ffffff;
              padding: 14px 32px;
              border-radius: 12px;
              text-decoration: none;
              font-weight: 700;
              font-size: 15px;
            "
          >
            Start Learning →
          </a>
        </div>

        <!-- Footer -->
        <div style="
          background: #C7D2FE;
          padding: 16px 32px;
          text-align: center;
        ">
          <p style="
            color: #3730A3;
            font-size: 12px;
            margin: 0;
          ">
            © 2026 StudySpace. All rights reserved.
          </p>
        </div>
      </div>
    `,
    })
}

export default sendEmail