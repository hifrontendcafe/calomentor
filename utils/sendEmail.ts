import { createTransport } from "nodemailer";

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "frontendcafe@gmail.com",
      pass: "f3c.youtub3",
    },
  });

  const options = {
    from: `"Calomentor" <frontendcafe@gmail.com>`,
    to,
    subject,
    html,
  };

  return await transporter.sendMail(options);
};
