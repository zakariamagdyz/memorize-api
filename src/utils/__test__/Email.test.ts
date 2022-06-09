import Email from '../Email';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

const user = {
  firstName: 'John',
  email: 'john@example.com',
};
const welcomeUrl = 'http://example.com/activateaccount/token';
const resetUrl = 'http://example.com/reset/token';

const WelcomeMail = new Email(user, welcomeUrl);
const ResetMail = new Email(user, resetUrl);

describe('Email', () => {
  // describe('Send mail for production', () => {});

  describe('Send mail for development', () => {
    it('Should send a welcome email', async () => {
      process.env.NODE_ENV = 'development';
      const mockedSendMail = jest.fn();
      nodemailer.createTransport = jest
        .fn()
        .mockReturnValue({ sendMail: mockedSendMail });
      //eslint-disable-next-line
      //@ts-ignore
      const mockedTransport = jest.spyOn(WelcomeMail, 'createNewTransport');
      //eslint-disable-next-line
      //@ts-ignore
      const mockedPrepareHtml = jest.spyOn(WelcomeMail, 'prepareHtmlTemplate');
      //eslint-disable-next-line
      //@ts-ignore
      const mockedSend = jest.spyOn(WelcomeMail, 'prepareHtmlTemplate');

      await WelcomeMail.sendWelcomeMail();

      expect(mockedTransport).toHaveBeenCalled();
      expect(mockedPrepareHtml).toHaveBeenCalled();
      expect(mockedPrepareHtml).toHaveBeenCalledWith(
        'welcome',
        'Account activation link (valid for 10 minutes)'
      );
      expect(mockedSend).toHaveBeenCalled();
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ host: 'smtp.mailtrap.io' })
      );

      expect(mockedSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'zakaria@magdy.io',
          to: user.email,
          subject: 'Account activation link (valid for 10 minutes)',
          html: expect.any(String),
        })
      );
    });
  });

  describe('Send mail for production', () => {
    it('Should send a reset email', async () => {
      process.env.NODE_ENV = 'production';
      const mockedSendMail = jest.fn();
      nodemailer.createTransport = jest
        .fn()
        .mockReturnValue({ sendMail: mockedSendMail });
      //eslint-disable-next-line
      //@ts-ignore
      const mockedTransport = jest.spyOn(ResetMail, 'createNewTransport');
      //eslint-disable-next-line
      //@ts-ignore
      const mockedPrepareHtml = jest.spyOn(ResetMail, 'prepareHtmlTemplate');
      //eslint-disable-next-line
      //@ts-ignore
      const mockedSend = jest.spyOn(ResetMail, 'prepareHtmlTemplate');

      await ResetMail.sendResetPasswordMail();

      expect(mockedTransport).toHaveBeenCalled();
      expect(mockedPrepareHtml).toHaveBeenCalled();
      expect(mockedPrepareHtml).toHaveBeenCalledWith(
        'resetPassword',
        'Your Password Reset Token (valid for 10 minutes)'
      );
      expect(mockedSend).toHaveBeenCalled();
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ service: 'gmail' })
      );

      expect(mockedSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'zakaria@magdy.io',
          to: user.email,
          subject: 'Your Password Reset Token (valid for 10 minutes)',
          html: expect.any(String),
        })
      );
    });
  });
});
