import { Alert, Button, Empty, Spinner } from "hero-design";
import React from "react";
import { sendGithubMessage, Response } from "../Messaging/GithubMessage";
import JiraCardDetail from "./JiraCardDetail";
import CreatingJiraCardModal from "./CreatingJiraCardModal";

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
              text="Can't extract Jira ID from pull request title"
            />
            {openModal && (
              <CreatingJiraCardModal
                host={host}
                token={token}
                email={email}
                closeModal={() => setOpenModal(false)}
              />
            )}
          </>
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
