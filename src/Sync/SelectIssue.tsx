import {
  Button,
  Icon,
  Input,
  Select,
  Spinner,
  Tooltip,
  Typography,
} from "hero-design";
import { useTheme } from "styled-components";
import React from "react";
import useAxios from "axios-hooks";

import { Issue } from "../JiraClient/types";
import { GithubIssueResponse } from "../Messaging/GithubMessage";
import { generatePullEndpoint, useGithubApi } from "../GithubApi";

type SelectOptions = React.ComponentProps<typeof Select>["options"];
type IconUrls = Record<string, string>;

const sampleJQL = 'assignee=currentuser() and status!="Done"';

const OptionWithIcon = ({ icon, text }: { icon: string; text: string }) => {
  const theme = useTheme();
  return (
    <div>
      <img
        src={icon}
        style={{
          height: 24,
          width: 24,
          marginRight: theme.space.small,
          verticalAlign: "middle",
          display: "inline-block",
        }}
      />
      {text}
    </div>
  );
};

export default ({
  githubIssue,
  setResponse,
}: {
  githubIssue: GithubIssueResponse;
  setResponse: (res: GithubIssueResponse) => void;
}) => {
  const theme = useTheme();

  const [errors, setErrors] = React.useState<string[]>([]);
  const [jql, setJql] = React.useState<string>(sampleJQL);

  const [issueId, setIssueId] = React.useState<string | number>("");
  const [issueQuery, setIssueQuery] = React.useState<string | undefined>(
    undefined
  );

  const { fetchData: fetchGithub, loading: updatingGithubTitle } =
    useGithubApi();

  const [{ data: issueData, loading: loadingIssues, error }, fetchIssues] =
    useAxios<{ issues: Array<Issue> }, { errorMessages: string[] }>(
      {
        url: `rest/api/2/search?jql=${jql}&fields=summary,issuetype&maxResults=500`,
        method: "GET",
      },
      { manual: true }
    );

  React.useEffect(() => {
    fetchIssues();
  }, []);

  const issueOptions: SelectOptions = React.useMemo(
    () =>
      issueData?.issues.map(({ id, key, fields }) => ({
        text: `[${key}] ${fields.summary}`,
        value: id,
      })) ?? [],
    [issueData]
  );

  const issueIcons: IconUrls = React.useMemo(
    () =>
      issueData?.issues.reduce(
        (acc, { id, fields }) => ({
          ...acc,
          [id]: fields.issuetype.iconUrl,
        }),
        {}
      ) ?? {},
    [issueData]
  );

  const selectedIssue: Issue | undefined = React.useMemo(
    () => issueData?.issues.find(({ id }) => id === issueId),
    [issueData, issueId]
  );

  const updateGithubIssueTitle = React.useCallback(() => {
    if (selectedIssue) {
      fetchGithub({
        endpoint: generatePullEndpoint(githubIssue),
        method: "PATCH",
        body: { title: `[${selectedIssue.key}] ${githubIssue.title}` },
      }).then(() => {
        setResponse({ ...githubIssue, jiraKey: selectedIssue.key });
      });
    }
  }, [selectedIssue, githubIssue, setResponse]);

  React.useEffect(() => {
    if (issueData && issueData.issues.length > 0) {
      document.getElementById("assignIssueID")!.click();
      setErrors([]);
    }
  }, [issueData]);

  React.useEffect(() => {
    if (error != null) {
      setErrors(error?.response?.data.errorMessages ?? []);
    }
  });

  return (
    <Spinner loading={loadingIssues || updatingGithubTitle}>
      <Typography.Text
        tagName="label"
        fontWeight="semi-bold"
        style={{ marginBottom: theme.space.medium, textAlign: "left" }}
      >
        Assign a Jira Issue
        <Tooltip
          interactive
          content={
            <div>
              Query an issue with
              <Button.Link
                style={{ marginLeft: theme.space.xsmall }}
                text="Jira JQL syntax"
                target="_blank"
                href="https://support.atlassian.com/jira-service-management-cloud/docs/advanced-search-reference-jql-fields/"
              />
            </div>
          }
          target={
            <Icon
              icon="circle-info"
              style={{
                marginLeft: theme.space.xsmall,
                verticalAlign: "middle",
              }}
            />
          }
        />
        <Input
          value={jql}
          onChange={(e) => setJql(e.target.value)}
          placeholder={'issueKey="PRO-42"'}
          suffix={
            <Button.Icon
              icon="search-outlined"
              intent="primary"
              onClick={() => fetchIssues()}
            />
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchIssues();
          }}
        />
        {errors.length > 0 && (
          <Typography.Text intent="error">{errors.join("\n")}</Typography.Text>
        )}
        <Select
          id="assignIssueID"
          value={issueId}
          style={{ marginTop: theme.space.small }}
          onChange={(value) => setIssueId(value ?? "")}
          loading={loadingIssues}
          query={issueQuery}
          placeholder="Select an issue"
          onQueryChange={setIssueQuery}
          noResults="No results"
          options={issueOptions}
          optionRenderer={({ option }) => (
            <OptionWithIcon
              icon={issueIcons[option.value]}
              text={option.text}
            />
          )}
        />
      </Typography.Text>
      <Button
        variant="text"
        text={`Assign ${selectedIssue?.key ?? ""}`}
        disabled={!issueId}
        onClick={updateGithubIssueTitle}
      />
    </Spinner>
  );
};
