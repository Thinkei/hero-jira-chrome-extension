import React from "react";

import createJiraClient from "../../JiraClient/createJiraClient";

export default ({
  host,
  token,
  email,
  jiraKey,
}: {
  host: string;
  token: string;
  email: string;
  jiraKey: string;
}) => {
  const client = React.useMemo(() => createJiraClient(host, token, email), []);
  const [issue, setIssue] = React.useState<Issue | undefined>();
  const [loading, setLoading] = React.useState<boolean>();
  return null;
};
