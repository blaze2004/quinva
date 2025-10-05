# prompt 1
create prisma schema for the application, it's like splitwise where users can create groups and manage their expenses and settle bills.

## context
empty prisma schema and project basic description

## output
prisma schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String?
  password    String
  groups      Group[]   @relation("UserToGroup")
  expenses    Expense[]
  splits      ExpenseSplit[]
  settlements Settlement[] @relation("UserSettlements")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Group {
  id          String    @id @default(cuid())
  name        String
  members     User[]    @relation("UserToGroup")
  expenses    Expense[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Expense {
  id          String    @id @default(cuid())
  description String
  amount      Float
  groupId     String
  group       Group     @relation(fields: [groupId], references: [id])
  paidById    String
  paidBy      User      @relation(fields: [paidById], references: [id])
  splits      ExpenseSplit[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ExpenseSplit {
  id        String  @id @default(cuid())
  amount    Float
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  expenseId String
  expense   Expense @relation(fields: [expenseId], references: [id])

  @@unique([userId, expenseId])
}

model Settlement {
  id            String   @id @default(cuid())
  amount        Float
  fromUserId    String
  fromUser      User     @relation("UserSettlements", fields: [fromUserId], references: [id])
  toUserId      String
  toUser        User     @relation(fields: [toUserId], references: [id])

  createdAt DateTime @default(now())
}
```


# prompt 2
 generate an email verification mail template using react-email and one for group invitation i.e when someone invites          you to join a group 
context : raycast email template from react-email templates list

## output
import { clientEnv } from "@/config/env/client";
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";

interface GroupInvitationProps {
    url: string;
    inviterName: string;
    groupName: string;
}

const baseUrl = clientEnv.NEXT_PUBLIC_PRODUCTION_URL;

export const GroupInvitation = ({
    url,
    inviterName,
    groupName,
}: GroupInvitationProps) => (
    <Html>
        <Head />
        <Body style={main}>
            <Preview>You've been invited to join a group!</Preview>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width={48}
                    height={48}
                    alt="Quinva"
                />
                <Heading style={heading}>👋 You're invited!</Heading>
                <Section style={body}>
                    <Text style={paragraph}>
                        {inviterName} has invited you to join the "{groupName}" group on Quinva.
                    </Text>
                    <Text style={paragraph}>
                        <Link style={link} href={url}>
                            Click here to accept the invitation
                        </Link>
                    </Text>
                    <Text style={paragraph}>
                        If you don't want to join the group, you can safely ignore this email.
                    </Text>
                </Section>
                <Text style={paragraph}>
                    Best regards,
                    <br />- The Quinva Team
                </Text>
                <Hr style={hr} />
                <Img
                    src={`${baseUrl}/logo.png`}
                    width={32}
                    height={32}
                    style={{
                        margin: "20px 0",
                    }}
                />
                <Text style={footer}>Quinva</Text>
            </Container>
        </Body>
    </Html>
);

GroupInvitation.PreviewProps = {
    url: clientEnv.NEXT_PUBLIC_PRODUCTION_URL,
    inviterName: "John Doe",
    groupName: "Project Quinva",
} as GroupInvitationProps;

export default GroupInvitation;

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 25px 48px",
};

const heading = {
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "48px",
};

const body = {
    margin: "24px 0",
};

const paragraph = {
    fontSize: "16px",
    lineHeight: "26px",
};

const link = {
    color: "#007AFF",
};

const hr = {
    borderColor: "#dddddd",
    marginTop: "48px",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    marginLeft: "4px",
};
 and similar for verify email as well.

## Output 2
prompt: can you make it consistent with the theme defined in globals.css without redefining colors in the email template, I   know react email doesn't share the defualt tailwind scope but is there any other way   

output: suggested redefining thr theme in a ts file and use that, which is not a good idea, it's  better to repeat several colors than repeating whole theme definition

## Output 3
prompt: create a shared layout for emails and define the theme and header, footer in there (for preview use dummy child), use the layout in verify email and group invitation email templates 

output: creted a common layout for emails and updated exisiting emails to use it.

# prompt 3

if i want to assign each group an icon or let say an emoji, what's the best option , storing the emoji directly in db or storing its name and rendering it  dynamically in the frontend (if second one is better also suggest any library which supports this,  i remember using fumadocs, it had a similar feature ) 

context: no context needed

output: use emoji names and render them with lucide react, it also created the dynamic icon component