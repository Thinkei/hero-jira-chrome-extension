import axios from "axios";

import { Issue, Transition, IssueTypeName } from "./types";
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
    "Content-Type": "application/json",
  };

  const getIssue = async (key: string) => {
    const response = await axios.get<Issue>(
      makeUrl(baseUrl, "rest/api/2/issue", key),
      {
        headers,
      }
    );
    return response.data;
  };

  const createIssue = async ({
    projectKey,
    issueTypeName = "Task",
    summary,
    description,
  }: {
    projectKey: string;
    issueTypeName?: IssueTypeName;
    summary: string;
    description: string;
  }) => {
    const response = await axios.post<Issue>(
      makeUrl(baseUrl, "rest/api/2/issue"),
      {
        fields: {
          summary,
          description,
          project: { key: projectKey },
          issueType: { name: issueTypeName },
        },
      },
      {
        headers,
      }
    );
    return response.data;
  };

  const getIssueTransisions = async (key: string) => {
    const response = await axios.get<TransitionsResponse>(
      makeUrl(baseUrl, "rest/api/2/issue", key, "transitions"),
      {
        headers,
      }
    );
    return response.data.transitions;
  };

  const updateIssueStatus = async ({
    key,
    transitionId,
  }: {
    key: string;
    transitionId: string;
  }) => {
    const response = await axios.post<undefined>(
      makeUrl(baseUrl, "rest/api/3/issue", key, "transitions"),
      {
        transition: { id: transitionId },
      },
      {
        headers,
      }
    );
    return response.data;
  };

  return { getIssue, createIssue, getIssueTransisions, updateIssueStatus };
};

export default createJiraClient;
