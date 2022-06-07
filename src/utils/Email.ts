import config from 'config';
import { resetPasswordTemplate } from './emails/reset-password.html';
import { welcomeTemplate } from './emails/welcome.html';
import nodemailer from 'nodemailer';
import { IHTMLTemplate } from './types/utilites';

const templates: IHTMLTemplate = {
  welcome: welcomeTemplate,
  resetPassword: resetPasswordTemplate,
};

export default class Email {
  private firstName: string;
  private from: string;
  private to: string;
  private clientUrl: string;
  constructor(
    { firstName, email }: { firstName: string; email: string },
    url: string
  ) {
    this.clientUrl = url;
    this.firstName = firstName;
    this.to = email;
    this.from = config.get<string>('EMAIL_FORM');
  }

  private createNewTransport() {
    if (process.env.NODE_ENV !== 'production') {
      return nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: config.get('MAIL_PORT'),
        auth: {
          user: '56d5f110f7d62a',
          pass: '2d951ed98899ec',
        },
        tls: { rejectUnauthorized: false },
      });
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.get<string>('GMAIL_ADDRESS'),
        pass: config.get<string>('GMAIL_PASS'),
      },
      tls: { rejectUnauthorized: false },
    });
  }

  private prepareHtmlTemplate(
    htmlTemp: keyof IHTMLTemplate,
    subject: string
  ): string {
    let temp = templates[htmlTemp];

    temp = temp.replace(/{SUBJECT}/g, subject);
    temp = temp.replace(/{FIRST_NAME}/g, this.firstName);
    temp = temp.replace(/{URL}/g, this.clientUrl);

    return temp;
  }

  private async send(
    htmlTemplate: keyof IHTMLTemplate,
    subject: string
  ): Promise<void> {
    const temp = this.prepareHtmlTemplate(htmlTemplate, subject);

    const mailOptions = {
      to: this.to,
      from: this.from,
      subject,
      html: temp,
    };

    await this.createNewTransport().sendMail(mailOptions);
  }

  public async sendWelcomeMail() {
    const welcomeSubject = 'Account activation link (valid for 10 minutes)';
    await this.send('welcome', welcomeSubject);
  }

  public async sendResetPasswordMail() {
    const resetPasswordSubject =
      'Your Password Reset Token (valid for 10 minutes)';
    await this.send('resetPassword', resetPasswordSubject);
  }
}
