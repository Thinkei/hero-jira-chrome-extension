import React from "react";
import { sendGithubMessage, Response } from "../Messaging/GithubMessage";
import JiraCardDetail from "./JiraCardDetail";
import CreatingJiraCardModal from "./CreatingJiraCardModal";
import { Alert, Button, Empty, Spinner } from "hero-design";

export default () => {
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
          <>
            <Empty
              extra={
                <Button
                  icon="add"
                  variant="filled"
                  intent="primary"
                  text="Create a Jira card"
                  onClick={() => setOpenModal(true)}
                />
              }
              style={{ textAlign: "center" }}
              text="Can't extract a Jira ID from this pull/issue"
            />
            {openModal && (
              <CreatingJiraCardModal
                closeModal={() => setOpenModal(false)}
                githubIssue={response}
                setResponse={setResponse}
              />
            )}
          </>
        );
      }
      return <JiraCardDetail jiraKey={jiraKey} />;
  }
};
