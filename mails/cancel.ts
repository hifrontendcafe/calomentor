interface CancelMailParams {
  mentorName: string;
  menteeName: string;
  date: string;
  time: string;
  forMentor: boolean;
}

export const cancelMail = ({
  mentorName,
  menteeName,
  date,
  time,
  forMentor,
}: CancelMailParams) => {
  return `<!doctype html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <title>
    </title>
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style type="text/css">
      #outlook a {
        padding: 0;
      }
  
      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
  
      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
  
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
  
      p {
        display: block;
        margin: 13px 0;
      }
    </style>
    <!--[if mso]>
          <noscript>
          <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
          </xml>
          </noscript>
          <![endif]-->
    <!--[if lte mso 11]>
          <style type="text/css">
            .mj-outlook-group-fix { width:100% !important; }
          </style>
          <![endif]-->
    <!--[if !mso]><!-->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css2?family=Work+Sans" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css2?family=Lexend+Deca" rel="stylesheet" type="text/css">
    <style type="text/css">
      @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
      @import url(https://fonts.googleapis.com/css2?family=Work+Sans);
      @import url(https://fonts.googleapis.com/css2?family=Lexend+Deca);
    </style>
    <!--<![endif]-->
    <style type="text/css">
      @media only screen and (min-width:480px) {
        .mj-column-per-100 {
          width: 100% !important;
          max-width: 100%;
        }
      }
    </style>
    <style media="screen and (min-width:480px)">
      .moz-text-html .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    </style>
    <style type="text/css">
      @media only screen and (max-width:480px) {
        table.mj-full-width-mobile {
          width: 100% !important;
        }
  
        td.mj-full-width-mobile {
          width: auto !important;
        }
      }
    </style>
  </head>
  
  <body style="word-spacing:normal;">
    <div style="">
      <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div style="margin:0px auto;max-width:600px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                    <tbody>
                      <tr>
                        <td style="font-size:0px;word-break:break-word;">
                          <div style="height:60px;line-height:60px;">&#8202;</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                          <div style="font-family:Work Sans, sans-serif;font-size:48px;font-weight:700;line-height:1;text-align:center;color:#27272A;">FrontendCafé</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:0px;word-break:break-word;">
                          <div style="height:60px;line-height:60px;">&#8202;</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="left" style="font-size:0px;padding:0px 20px;word-break:break-word;">
                          <div style="font-family:Lexend Deca, sans-serif;font-size:18px;font-weight:500;line-height:1.5;text-align:left;color:#27272A;">
                            Hola ${
                              forMentor ? mentorName : menteeName
                            }, tu mentoria con ${
                              forMentor ? menteeName : mentorName
                            } ha sido cancelada. Si tenés alguna consulta mandanos un mail a frontendcafe@gmail.com.
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:0px;word-break:break-word;">
                          <div style="height:10px;line-height:10px;">&#8202;</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:0px;word-break:break-word;">
                          <div style="height:30px;line-height:30px;">&#8202;</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="left" style="font-size:0px;padding:0px 20px;word-break:break-word;">
                          <div style="font-family:Lexend Deca, sans-serif;font-size:18px;font-weight:700;line-height:1;text-align:left;color:#27272A;">Día: ${date}.</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:0px;word-break:break-word;">
                          <div style="height:10px;line-height:10px;">&#8202;</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="left" style="font-size:0px;padding:0px 20px;word-break:break-word;">
                          <div style="font-family:Lexend Deca, sans-serif;font-size:18px;font-weight:700;line-height:1;text-align:left;color:#27272A;">Hora: ${time}.</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:0px;word-break:break-word;">
                          <div style="height:60px;line-height:60px;">&#8202;</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="left" vertical-align="middle" class="btn" style="font-size:0px;word-break:break-word;">
                          <table border="0" cellpadding="0" cellspacing="20px" role="presentation" style="border-collapse:separate;line-height:100%;">
                            <tr>
                              <td align="center" bgcolor="#00876D" role="presentation" style="border:none;border-radius:3px;cursor:auto;mso-padding-alt:10px 25px;background:#00876D; vertical-align: middle;" valign="middle">
                                <a style=";display:inline-block;background:#00876D;color:#ffffff;font-family:Lexend Deca, sans-serif;font-size:18px;font-weight:500;line-height:100%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:3px;width: 150px;height: 20px;text-decoration: none;color: #ffffff;" href="mailto:frontendcafe@gmail.com">Contáctanos</a>
                              </td>
                              <td align="center" bgcolor="#ffffff" role="presentation" style="border:1px solid rgba(0, 0, 0, 0.2);border-radius:3px;cursor:auto;mso-padding-alt:10px 25px;background:#ffffff;vertical-align: middle;" valign="middle">
                                <a style="display:inline-block;background:#ffffff;color:#27272A;font-family:Lexend Deca, sans-serif;font-size:18px;font-weight:500;line-height:100%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:3px;width: 150px;height: 20px;text-decoration: none;color: #27272A" href="https://discord.gg/frontendcafe">Ingresá a Discord</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                          <p style="border-top:solid 1px rgba(0, 0, 0, 0.1);font-size:1px;margin:0px auto;width:85%;">
                          </p>
                          <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px rgba(0, 0, 0, 0.1);font-size:1px;margin:0px auto;width:467.5px;" role="presentation" width="467.5px" ><tr><td style="height:0;line-height:0;"> &nbsp;
  </td></tr></table><![endif]-->
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                            <tbody>
                              <tr>
                                <td style="width:50px;">
                                  <img height="auto" src="https://res.cloudinary.com/du7xgj6ms/image/upload/v1645297198/v2_pmv9wm.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="50" />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]></td></tr></table><![endif]-->
    </div>
  </body>
  </html>`;
};
