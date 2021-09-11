import { Alert, Spinner, Typography } from "hero-design";
import React from "react";
import useAxios from "axios-hooks";
import { Button } from "hero-design";
import { useTheme } from "styled-components";

import { Issue } from "../../JiraClient/types";
import Status from "./Status";
import JiraConfigContext from "../../context/JiraConfigContext";

export default ({ jiraKey }: { jiraKey: string }) => {
  const theme = useTheme();
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
      <div
        style={{
          marginBottom: theme.space.small,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button.Link
          target="_blank"
          text={jiraKey}
          href={`${jiraConfig.host}/browse/${jiraKey}`}
        />
        <Typography.Text tagName="div">
          {"Status: "}
          <Status
            currentStatusName={issue.fields.status.name}
            jiraKey={jiraKey}
          />
        </Typography.Text>
      </div>
      <Typography.Title level={5} style={{ marginBottom: theme.space.medium }}>
        <>
          <img
            src={issue.fields.issuetype.iconUrl}
            style={{
              height: 24,
              width: 24,
              marginRight: theme.space.small,
              verticalAlign: "middle",
              display: "inline-block",
            }}
          />
          {issue.fields.summary}
        </>
      </Typography.Title>
      <Typography.Text>
        <b>Description:</b>
        <br />
        {issue.fields.description}
      </Typography.Text>
    </>
  );
};
