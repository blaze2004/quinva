import { Heading, Link, Section, Text } from "@react-email/components";
import EmailLayout from "./layout";

interface ResetPasswordProps {
  url: string;
}

export const ResetPassword = ({ url }: ResetPasswordProps) => (
  <EmailLayout>
    <Heading className="heading">🔑 Reset Your Password</Heading>
    <Section className="body-section">
      <Text className="paragraph">
        We received a request to reset your password for your Quinva account.
      </Text>
      <Text className="paragraph">
        <Link className="link" href={url}>
          Click here to reset your password
        </Link>
      </Text>
      <Text className="paragraph">
        If you didn't request a password reset, you can safely ignore this
        email. Your password will remain unchanged.
      </Text>
    </Section>
    <Text className="paragraph">
      Best regards,
      <br />- The Quinva Team
    </Text>
  </EmailLayout>
);

ResetPassword.PreviewProps = {
  url: "https://quinva.com",
} as ResetPasswordProps;

export default ResetPassword;
