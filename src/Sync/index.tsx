import { Alert, Button, Spinner, Typography } from "hero-design";
import { useTheme } from "styled-components";
import React from "react";

import { sendGithubMessage, Response } from "../Messaging/GithubMessage";
import CreatingJiraCardModal from "./CreatingJiraCardModal";
import JiraCardDetail from "./JiraCardDetail";
import SelectIssue from "./SelectIssue";

export default () => {
  const theme = useTheme();
  const [response, setResponse] = React.useState<Response | undefined>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [openModal, setOpenModal] = React.useState<boolean>(false);

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
    case "IssueResponse":
      const jiraKey = response.jiraKey;
      if (jiraKey === undefined) {
        return (
          <div style={{ textAlign: "center" }}>
            <Typography.Text style={{ marginBottom: theme.space.medium }}>
              Can't find a Jira key in this PR/issue
            </Typography.Text>
            <Button
              icon="add"
              variant="filled"
              intent="primary"
              text="Create a Jira issue"
              onClick={() => setOpenModal(true)}
            />
            <div
              style={{
                textAlign: "center",
                marginBottom: theme.space.medium,
                marginTop: theme.space.medium,
              }}
            >
              -- or --
            </div>
            <SelectIssue githubIssue={response} setResponse={setResponse} />
            {openModal && (
              <CreatingJiraCardModal
                closeModal={() => setOpenModal(false)}
                githubIssue={response}
                setResponse={setResponse}
              />
            )}
          </div>
        );
      }
      return <JiraCardDetail jiraKey={jiraKey} />;
  }
};
