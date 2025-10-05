import { Heading, Link, Section, Text } from "@react-email/components";
import EmailLayout from "./layout";

interface EmailVerificationProps {
  url: string;
}

export const EmailVerification = ({ url }: EmailVerificationProps) => (
  <EmailLayout>
    <Heading className="heading">✉️ Verify your email address</Heading>
    <Section className="body-section">
      <Text className="paragraph">
        Thanks for signing up! Please verify your email address to continue.
      </Text>
      <Text className="paragraph">
        <Link className="link" href={url}>
          Click here to verify your email address
        </Link>
      </Text>
      <Text className="paragraph">
        If you didn't create an account with Quinva, you can safely ignore this
        email.
      </Text>
    </Section>
    <Text className="paragraph">
      Best regards,
      <br />- The Quinva Team
    </Text>
  </EmailLayout>
);

EmailVerification.PreviewProps = {
  url: "https://quinva.com",
} as EmailVerificationProps;

export default EmailVerification;
