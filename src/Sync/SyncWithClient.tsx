import { Alert, Button, Spinner } from "hero-design";
import React from "react";
import { sendGithubMessage, Response } from "../Messaging/GithubMessage";
import JiraCardDetail from "./JiraCardDetail";

export default ({
  host,
  token,
  email,
}: {
  host: string;
  token: string;
  email: string;
}) => {
  const [response, setResponse] = React.useState<Response | undefined>();
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    sendGithubMessage((response) => {
      setResponse(response);
      setLoading(false);
    });
  }, []);

  if (loading === true) return <Spinner />;

  if (response === undefined) {
    return (
      <Alert
        intent="warning"
        content={"Only support github pull or issue page"}
      />
    );
  }

  switch (response.__tag) {
    case "ErrorResponse":
      return <Alert intent="warning" content={response.errorMessage} />;
    case "PullResponse":
      const jiraKey = response.jiraKey;
      if (jiraKey) {
        return (
          <Alert
            intent="warning"
            content={"Can't extract Jira ID from pull request title"}
          />
        );
      }
      return (
        <JiraCardDetail
          host={host}
          token={token}
          email={email}
          jiraKey={jiraKey}
        />
      );
    case "IssueResponse":
      return <div>{response.title}</div>;
  }
};
