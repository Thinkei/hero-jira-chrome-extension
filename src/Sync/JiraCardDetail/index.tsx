import { Alert, Spinner, Table, Typography } from "hero-design";
import React from "react";
import { Button } from "hero-design";

import createJiraClient from "../../JiraClient/createJiraClient";
import { Issue } from "../../JiraClient/types";
import Status from "./Status";

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
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    client.getIssue(jiraKey).then((loadedIssue) => {
      setIssue(loadedIssue);
      setLoading(false);
    });
  }, []);

  if (loading === true) return <Spinner />;

  if (issue === undefined)
    return (
      <Alert intent="warning" content={`Jira card ${jiraKey} not found`} />
    );

  console.log({ issue });

  return (
    <>
      <Typography.Title level={3}>Jira card</Typography.Title>
      <ul>
        <li>
          <Button.Link
            target="_blank"
            text={jiraKey}
            href={`${host}/browse/${jiraKey}`}
          />
        </li>
        <li>Title: {issue.fields.description}</li>
        <li>Summary: {issue.fields.summary}</li>
        <li>
          Status:
          <Status
            value={issue.fields.status.name}
            host={host}
            token={token}
            email={email}
            jiraKey={jiraKey}
          />
        </li>
      </ul>
    </>
  );
};
