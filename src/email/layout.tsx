import { Head, Hr, Img, Text } from "@react-email/components";
import type React from "react";
import { clientEnv } from "@/config/env/client";

interface EmailLayoutProps {
  children: React.ReactNode;
}

const baseUrl = clientEnv.NEXT_PUBLIC_PRODUCTION_URL;

const EmailLayout: React.FC<EmailLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Quinva</title>
        <style>{`
          body {
            font-family: sans-serif;
            background-color: #f4f4f4;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
          }
          .header {
            padding: 20px 0;
            text-align: center;
            border-bottom: 1px solid #dddddd;
            margin-bottom: 20px;
          }
          .heading {
            font-size: 28px;
            font-weight: bold;
            margin-top: 48px;
          }
          .body-section {
            margin: 24px 0;
          }
          .paragraph {
            font-size: 16px;
            line-height: 26px;
          }
          .link {
            color: #007AFF;
          }
        `}</style>
      </Head>
      <body>
        <div className="container">
          <div className="header">
            <Img
              src={`${baseUrl}/logo.png`}
              width={48}
              height={48}
              alt="Quinva logo"
              style={{
                margin: "0 auto",
              }}
            />
          </div>
          <div className="content">{children}</div>
          <Hr style={hr} />
          <Img
            src={`${baseUrl}/logo.png`}
            width={32}
            height={32}
            style={{
              margin: "20px 0",
            }}
            alt="Quinva logo"
          />
          <Text style={footer}>Quinva</Text>
        </div>
      </body>
    </html>
  );
};

export default EmailLayout;

const hr = {
  borderColor: "#dddddd",
  marginTop: "48px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginLeft: "4px",
};
