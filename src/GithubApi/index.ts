import React from "react";

import { PullResponse } from "../Messaging/GithubMessage";
import GithubConfigContext from "../context/GithubConfigContext";

type FetchMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export const generatePullEndpoint = ({
  organisation,
  project,
  pullId,
}: PullResponse) =>
  `https://api.github.com/repos/${organisation}/${project}/pulls/${pullId}`;

export const useGithubApi = () => {
  const { token } = React.useContext(GithubConfigContext);
  const [loading, setLoading] = React.useState(false);

  const fetchData = React.useCallback(
    async ({
      endpoint,
      method = "GET",
      body,
    }: {
      endpoint: string;
      method?: FetchMethod;
      body: string | object;
    }) => {
      setLoading(true);
      await fetch(endpoint, {
        method,
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${token}`,
        },
        body: typeof body === "string" ? body : JSON.stringify(body),
      });
      setLoading(false);
    },
    [token]
  );

  return { fetchData, loading };
};
