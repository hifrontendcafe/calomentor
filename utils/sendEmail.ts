import { createTransport, TransportOptions } from "nodemailer";

const config: TransportOptions = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.CALOMENTOR_MAIL,
    clientId: process.env.CALOMENTOR_MAIL_CLIENT_ID,
    clientSecret: process.env.CALOMENTOR_MAIL_CLIENT_SECRET,
    refreshToken: process.env.CALOMENTOR_MAIL_REFRESH_TOKEN,
    accessToken: process.env.CALOMENTOR_MAIL_ACCESS_TOKEN,
    expires: "3599",
  },
} as TransportOptions;

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  icalContent?: string
) => {
  const transporter = createTransport(config);

  const options: any = {
    from: `"Calomentor" <frontendcafe@gmail.com>`,
    to,
    subject,
    html,
  };

  if (icalContent) {
    options.icalEvent = {
      filename: "invite.ics",
      content: icalContent,
    };
  }

  return await transporter.sendMail(options);
};
