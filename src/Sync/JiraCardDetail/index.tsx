import { Alert, Button, Spinner, Tooltip, Typography } from "hero-design";
import { useTheme } from "styled-components";
import React from "react";
import useAxios from "axios-hooks";
import styled from "styled-components";

import { Issue } from "../../JiraClient/types";
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

export default ({ jiraKey }: { jiraKey: string }) => {
  const theme = useTheme();
  const jiraConfig = React.useContext(JiraConfigContext);
  const jiraLink = `${jiraConfig.host}/browse/${jiraKey}`;
  const [linkCopied, setLinkCopied] = React.useState(false);

  const [{ data: issue, loading, error }] = useAxios<Issue>(
    `/rest/api/2/issue/${jiraKey}?fields=status,summary,description,issuetype&expand=renderedFields.description`
  );

  const issueDescription = React.useMemo(
    () =>
      (issue?.renderedFields?.description || issue?.fields.description || "N/A")
        .replace(
          /\/secure\/attachment/g,
          `${jiraConfig.host}/secure/attachment`
        )
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
            content={linkCopied ? "Copy! :)" : "Copy?"}
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
