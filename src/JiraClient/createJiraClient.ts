import axios from "axios";

import { Issue, IssueTypeName } from "./types";
import { makeUrl } from "./utils";

const createJiraClient = (baseUrl: string, token: string, email: string) => {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString(
      "base64"
    )}`,
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
        headers,
        body: {
          fields: {
            summary,
            description,
            project: { key: projectKey },
            issueType: { name: issueTypeName },
          },
        },
      }
    );
    return response.data;
  };

  return { getIssue, createIssue };
};

export default createJiraClient;
