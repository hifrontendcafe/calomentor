export const reminderMail = ({
  mentorName,
  menteeName,
  date,
  time,
  cancelLink,
  confirmationLink,
  forMentor,
}) => {
  return `<!DOCTYPE html>
  <html
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office"
  >
    <head>
      <title> </title>
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <!--<![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
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
              <o:AllowPNG />
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
      <![endif]-->
      <!--[if lte mso 11]>
        <style type="text/css">
          .mj-outlook-group-fix {
            width: 100% !important;
          }
        </style>
      <![endif]-->
      <!--[if !mso]><!-->
      <link
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700"
        rel="stylesheet"
        type="text/css"
      />
      <style type="text/css">
        @import url(https://fonts.googleapis.com/css?family=Roboto:300,400,500,700);
      </style>
      <!--<![endif]-->
      <style type="text/css">
        @media only screen and (min-width: 480px) {
          .mj-column-px-600 {
            width: 600px !important;
            max-width: 600px;
          }
  
          .mj-column-px-500 {
            width: 500px !important;
            max-width: 500px;
          }
  
          .mj-column-per-100 {
            width: 100% !important;
            max-width: 100%;
          }
        }
      </style>
      <style media="screen and (min-width:480px)">
        .moz-text-html .mj-column-px-600 {
          width: 600px !important;
          max-width: 600px;
        }
  
        .moz-text-html .mj-column-px-500 {
          width: 500px !important;
          max-width: 500px;
        }
  
        .moz-text-html .mj-column-per-100 {
          width: 100% !important;
          max-width: 100%;
        }
      </style>
      <style type="text/css">
        @media only screen and (max-width: 480px) {
          table.mj-full-width-mobile {
            width: 100% !important;
          }
  
          td.mj-full-width-mobile {
            width: auto !important;
          }
        }
      </style>
    </head>
  
    <body style="word-spacing: normal; background-color: #ffffff">
      <div style="background-color: #ffffff">
        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
        <div
          style="
            background: #ffffff;
            background-color: #ffffff;
            margin: 0px auto;
            max-width: 600px;
          "
        >
          <table
            align="center"
            border="0"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="background: #ffffff; background-color: #ffffff; width: 100%"
          >
            <tbody>
              <tr>
                <td
                  style="
                    direction: ltr;
                    font-size: 0px;
                    padding: 20px 0;
                    text-align: center;
                  "
                >
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                  <div
                    class="mj-column-px-600 mj-outlook-group-fix"
                    style="
                      font-size: 0px;
                      text-align: left;
                      direction: ltr;
                      display: inline-block;
                      vertical-align: top;
                      width: 100%;
                    "
                  >
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="vertical-align: top"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td
                            align="center"
                            style="
                              font-size: 0px;
                              padding: 10px 25px;
                              word-break: break-word;
                            "
                          >
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                border-collapse: collapse;
                                border-spacing: 0px;
                              "
                            >
                              <tbody>
                                <tr>
                                  <td style="width: 550px">
                                    <img
                                      height="auto"
                                      src="https://res.cloudinary.com/du7xgj6ms/image/upload/v1632340114/Reminader-header_hx9gfg.png"
                                      style="
                                        border: 0;
                                        display: block;
                                        outline: none;
                                        text-decoration: none;
                                        height: auto;
                                        width: 100%;
                                        font-size: 13px;
                                      "
                                      width="550"
                                    />
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
        <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
        <div
          style="
            background: #ffffff;
            background-color: #ffffff;
            margin: 0px auto;
            max-width: 600px;
          "
        >
          <table
            align="center"
            border="0"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="background: #ffffff; background-color: #ffffff; width: 100%"
          >
            <tbody>
              <tr>
                <td
                  style="
                    direction: ltr;
                    font-size: 0px;
                    padding: 20px 0;
                    text-align: center;
                  "
                >
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:500px;" ><![endif]-->
                  <div
                    class="mj-column-px-500 mj-outlook-group-fix"
                    style="
                      font-size: 0px;
                      text-align: left;
                      direction: ltr;
                      display: inline-block;
                      vertical-align: top;
                      width: 100%;
                    "
                  >
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="vertical-align: top"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td
                            align="justify"
                            style="
                              font-size: 0px;
                              padding: 10px 40px;
                              word-break: break-word;
                            "
                          >
                            <div
                              style="
                                font-family: Roboto, sans-serif;
                                font-size: 15px;
                                line-height: 22px;
                                text-align: justify;
                                color: #000000;
                              "
                            >
                            Hola ${
                              forMentor ? mentorName : menteeName
                            }, te recordamos que tenés una
                            mentoría el día ${date} a las ${time} hs
                            (hora Argentina) con ${
                              forMentor ? menteeName : mentorName
                            }. La misma se llevara a cabo en el servidor de FrontendCafé.
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td
                            align="justify"
                            style="
                              font-size: 0px;
                              padding: 10px 40px;
                              word-break: break-word;
                            "
                          >
                            <div
                              style="
                                font-family: Roboto, sans-serif;
                                font-size: 15px;
                                line-height: 22px;
                                text-align: justify;
                                color: #000000;
                              "
                            >
                            Podés acceder al discord <a href="https://discord.gg/frontendcafe">aquí</a>.
                            </div>
                          </td>
                        </tr>
                        ${
                          !forMentor &&
                          `<tr>
                          <td
                            align="justify"
                            style="
                              font-size: 0px;
                              padding: 10px 40px;
                              word-break: break-word;
                            "
                          >
                            <div
                              style="
                                font-family: Roboto, sans-serif;
                                font-size: 15px;
                                line-height: 22px;
                                text-align: justify;
                                color: #000000;
                              "
                            >
                            Debes confirmar la asistencia a tu mentoría desde
                            <a href="${confirmationLink}">aquí</a>.
                            </div>
                          </td>
                        </tr>`
                        }
                        <tr>
                          <td
                            align="justify"
                            style="
                              font-size: 0px;
                              padding: 10px 40px;
                              word-break: break-word;
                            "
                          >
                            <div
                              style="
                                font-family: Roboto, sans-serif;
                                font-size: 15px;
                                line-height: 22px;
                                text-align: justify;
                                color: #000000;
                              "
                            >
                            Si no podés asistir podés cancelar tu mentoría desde
                            <a href="${cancelLink}">aquí</a>.
                            </div>
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
        <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
        <div style="margin: 0px auto; max-width: 600px">
          <table
            align="center"
            border="0"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="width: 100%"
          >
            <tbody>
              <tr>
                <td
                  style="
                    direction: ltr;
                    font-size: 0px;
                    padding: 20px 0px 20px 0px;
                    text-align: center;
                  "
                >
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                  <div
                    class="mj-column-per-100 mj-outlook-group-fix"
                    style="
                      font-size: 0px;
                      text-align: left;
                      direction: ltr;
                      display: inline-block;
                      vertical-align: top;
                      width: 100%;
                    "
                  >
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="vertical-align: top"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td
                            align="center"
                            style="
                              font-size: 0px;
                              padding: 10px 25px;
                              word-break: break-word;
                            "
                          >
                            <p
                              style="
                                border-top: solid 0.5px #cccccc;
                                font-size: 1px;
                                margin: 0px auto;
                                width: 60%;
                              "
                            ></p>
                            <!--[if mso | IE
                              ]><table
                                align="center"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                style="
                                  border-top: solid 0.5px #cccccc;
                                  font-size: 1px;
                                  margin: 0px auto;
                                  width: 330px;
                                "
                                role="presentation"
                                width="330px"
                              >
                                <tr>
                                  <td style="height: 0; line-height: 0">
                                    &nbsp;
                                  </td>
                                </tr>
                              </table><!
                            [endif]-->
                          </td>
                        </tr>
                        <tr>
                          <td
                            align="center"
                            style="
                              font-size: 0px;
                              padding: 10px 25px;
                              word-break: break-word;
                            "
                          >
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                border-collapse: collapse;
                                border-spacing: 0px;
                              "
                            >
                              <tbody>
                                <tr>
                                  <td style="width: 34px">
                                    <img
                                      height="auto"
                                      src="https://res.cloudinary.com/du7xgj6ms/image/upload/v1630892022/Iso_FEC_fwxmfh.png"
                                      style="
                                        border: 0;
                                        display: block;
                                        outline: none;
                                        text-decoration: none;
                                        height: auto;
                                        width: 100%;
                                        font-size: 13px;
                                      "
                                      width="34"
                                    />
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
  </html>
  `;
};
