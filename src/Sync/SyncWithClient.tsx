import { Button } from "hero-design";
import React from "react";
import createJiraClient from "../JiraClient/createJiraClient";

export default ({
  host,
  token,
  email,
}: {
  host: string;
  token: string;
  email: string;
}) => {
  const client = React.useMemo(() => createJiraClient(host, token, email), []);

  return (
    <Button
      text="Test"
      onClick={async () => {
        const data = await client.getIssue("ANS-446");
        console.log(data.fields);
      }}
    />
  );
};
