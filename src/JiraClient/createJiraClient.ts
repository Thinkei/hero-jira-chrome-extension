import axios from "axios";

import { Issue, Transition, IssueCreationFields, Project } from "./types";
import { makeUrl } from "./utils";

type TransitionsResponse = {
  transitions: Array<Transition>;
};

const createJiraClient = (baseUrl: string, token: string, email: string) => {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString(
      "base64"
    )}`,
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  const getIssue = async (key: string) => {
    const response = await axios.get<Issue>(
      makeUrl(baseUrl, "rest/api/2/issue", key),
      { headers }
    );
    return response.data;
  };

  const createIssue = async ({
    projectId,
    issuetypeId,
    summary,
    description
  }: IssueCreationFields) => {
    const response = await axios.post<Issue>(
      makeUrl(baseUrl, "rest/api/2/issue"),
      {
        fields: {
          summary,
          description,
          project: { id: projectId },
          issuetype: { id: issuetypeId }
        }
      },
      { headers }
    );
    return response.data;
  };

  const getIssueTransisions = async (key: string) => {
    const response = await axios.get<TransitionsResponse>(
      makeUrl(baseUrl, "rest/api/2/issue", key, "transitions"),
      { headers }
    );
    return response.data.transitions;
  };

  const updateIssueStatus = async ({
    key,
    transitionId
  }: {
    key: string;
    transitionId: string;
  }) => {
    const response = await axios.post<undefined>(
      makeUrl(baseUrl, "rest/api/3/issue", key, "transitions"),
      { transition: { id: transitionId } },
      { headers }
    );
    return response.data;
  };

  const getIssueCreateMeta = async () => {
    const response = await axios.get<{ projects: Project[] }>(
      makeUrl(baseUrl, "rest/api/2/issue/createmeta"),
      { headers }
    );
    return response.data;
  };

  return {
    getIssue,
    createIssue,
    getIssueCreateMeta,
    getIssueTransisions,
    updateIssueStatus
  };
};

export default createJiraClient;
