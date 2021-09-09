import { Alert, Spinner, Typography } from "hero-design";
import React from "react";
import useAxios from "axios-hooks";
import { Button } from "hero-design";

import { Issue } from "../../JiraClient/types";
import Status from "./Status";
import JiraConfigContext from "../../context/JiraConfigContext";

export default ({ jiraKey }: { jiraKey: string }) => {
  const [{ data: issue, loading, error }] = useAxios<Issue>(
    `/rest/api/2/issue/${jiraKey}`
  );
  const jiraConfig = React.useContext(JiraConfigContext);

  if (loading === true) return <Spinner />;

  if (issue === undefined)
    return (
      <Alert intent="warning" content={`Jira card ${jiraKey} not found`} />
    );

  if (error !== null)
    return <Alert intent="error" content={JSON.stringify(error)} />;

  return (
    <>
      <Typography.Title level={3}>Jira card</Typography.Title>
      <ul>
        <li>
          <Button.Link
            target="_blank"
            text={jiraKey}
            href={`${jiraConfig.host}/browse/${jiraKey}`}
          />
        </li>
        <li>Title: {issue.fields.summary}</li>
        <li>Summary: {issue.fields.description}</li>
        <li>
          Status:
          <Status
            currentStatusName={issue.fields.status.name}
            jiraKey={jiraKey}
          />
        </li>
      </ul>
    </>
  );
};
