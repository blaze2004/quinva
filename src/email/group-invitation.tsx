import { Heading, Link, Section, Text } from "@react-email/components";
import EmailLayout from "./layout";

interface GroupInvitationProps {
  url: string;
  inviterName: string;
  groupName: string;
}

export const GroupInvitation = ({
  url,
  inviterName,
  groupName,
}: GroupInvitationProps) => (
  <EmailLayout>
    <Heading className="heading">👋 You're invited!</Heading>
    <Section className="body-section">
      <Text className="paragraph">
        {inviterName} has invited you to join the "{groupName}" group on Quinva.
      </Text>
      <Text className="paragraph">
        <Link className="link" href={url}>
          Click here to accept the invitation
        </Link>
      </Text>
      <Text className="paragraph">
        If you don't want to join the group, you can safely ignore this email.
      </Text>
    </Section>
    <Text className="paragraph">
      Best regards,
      <br />- The Quinva Team
    </Text>
  </EmailLayout>
);

GroupInvitation.PreviewProps = {
  url: "https://quinva.com",
  inviterName: "Tony Stark",
  groupName: "Project Quinva",
} as GroupInvitationProps;

export default GroupInvitation;
