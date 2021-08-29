import { Alert, Button, Spinner } from "hero-design";
import React from "react";
import createJiraClient from "../JiraClient/createJiraClient";
import { sendGithubMessage, Response } from "../Messaging/GithubMessage";

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
  const [response, setResponse] = React.useState<Response | undefined>();

  React.useEffect(() => {
    sendGithubMessage((response) => {
      setResponse(response);
    });
  }, []);

  if (response === undefined) {
    return <Spinner />;
  }

  switch (response.__tag) {
    case "ErrorResponse":
      return <Alert intent="warning" content={response.errorMessage} />;
    case "PullResponse":
      return <div>{response.jiraKey}</div>;
    case "IssueResponse":
      return <div>{response.title}</div>;
  }
};
