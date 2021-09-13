import { Alert, Button, Spinner, Tooltip, Typography } from "hero-design";
import React from "react";
import styled, { useTheme } from "styled-components";
import useAxios from "axios-hooks";

import {
  GithubIssueResponse,
  GithubStatus,
} from "../../Messaging/GithubMessage";
import { Issue, Transition } from "../../JiraClient/types";
import JiraConfigContext from "../../context/JiraConfigContext";
import Status from "./Status";

const DescriptionStyledWrapper = styled.div`
  img,
  pre,
  video {
    height: auto;
    max-width: 90vw;
  }
  pre {
    overflow: auto;
  }
  a {
    color: ${({ theme }) => theme.colors.blue};
  }
  table {
    border-collapse: collapse;
    th {
      background-color: ${({ theme }) => theme.colors.greyLight90};
      border: solid 1px ${({ theme }) => theme.colors.greyLight60};
      padding: ${({ theme }) => theme.space.small}px;
    }
    tr:hover {
      background: ${({ theme }) => theme.colors.blueLight90};
    }
    td {
      margin: 0;
      border: solid 1px ${({ theme }) => theme.colors.greyLight60};
      padding: ${({ theme }) => theme.space.small}px;
    }
  }
`;

const StatusWarning = ({
  githubStatus,
  jiraStatus,
}: {
  githubStatus?: GithubStatus;
  jiraStatus?: Transition["name"];
}) => {
  const theme = useTheme();

  const statusOutdated = React.useMemo(() => {
    if (githubStatus === "Open" && jiraStatus === "To Do") return true;
    if (githubStatus === "Merged" && jiraStatus !== "Done") return true;
    if (githubStatus !== "Merged" && jiraStatus == "Done") return true;
    return false;
  }, [githubStatus, jiraStatus]);

  return statusOutdated ? (
    <Alert
      variant="outlined"
      intent="warning"
      style={{ marginBottom: theme.space.medium }}
      content="This ticket status is outdated."
    />
  ) : null;
};

export default ({ githubIssue }: { githubIssue: GithubIssueResponse }) => {
  const theme = useTheme();
  const { jiraKey = "" } = githubIssue;
  const jiraConfig = React.useContext(JiraConfigContext);
  const jiraLink = `${jiraConfig.host}/browse/${jiraKey}`;
  const [linkCopied, setLinkCopied] = React.useState(false);

  const [{ data: issue, loading, error }] = useAxios<Issue>(
    `/rest/api/2/issue/${jiraKey}?fields=status,summary,description,issuetype&expand=renderedFields.description`
  );

  const issueDescription = React.useMemo<string>(
    () =>
      (issue?.renderedFields?.description || issue?.fields.description || "N/A")
        // attachments in the description missing the host
        .replace(
          /\/secure\/attachment/g,
          `${jiraConfig.host}/secure/attachment`
        )
        // videos in description is redered with <embed> which is not playable in an extension
        .replace(/<embed /g, "<video autoplay controls "),
    [issue, jiraConfig.host]
  );

  if (loading === true) return <Spinner />;

  if (issue === undefined)
    return (
      <Alert intent="warning" content={`Jira card ${jiraKey} not found`} />
    );

  if (error !== null)
    return <Alert intent="error" content={JSON.stringify(error)} />;

  return (
    <>
      <StatusWarning
        githubStatus={githubIssue.status}
        jiraStatus={issue.fields.status.name}
      />
      <div
        style={{
          marginBottom: theme.space.small,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Tooltip
            content={linkCopied ? "Copied! :)" : "Copy?"}
            target={
              <Button.Icon
                icon="link-2"
                intent={linkCopied ? "subdued-text" : "primary"}
                style={{
                  marginRight: theme.space.small,
                  verticalAlign: "middle",
                }}
                onClick={() => {
                  navigator.clipboard.writeText(jiraLink);
                  setLinkCopied(true);
                }}
              />
            }
          />
          <Button.Link target="_blank" text={jiraKey} href={jiraLink} />
        </div>
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
      <DescriptionStyledWrapper>
        <b>Description:</b>
        <br />
        <div
          dangerouslySetInnerHTML={{
            __html: issueDescription,
          }}
        />
      </DescriptionStyledWrapper>
    </>
  );
};
