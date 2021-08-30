import { Tag, Select } from "hero-design";
import React from "react";

import createJiraClient from "../../JiraClient/createJiraClient";

export default ({
  value,
  host,
  token,
  email,
  jiraKey,
}: {
  value: string;
  host: string;
  token: string;
  email: string;
  jiraKey: string;
}) => {
  const client = React.useMemo(() => createJiraClient(host, token, email), []);
  const [selectValue, setSelectValue] = React.useState<
    string | number | undefined
  >();
  const [updatingStatus, setUpdatingStatus] = React.useState<boolean>(false);
  const [loadingTransitions, setLoadingTransitions] =
    React.useState<boolean>(true);

  const [options, setOptions] = React.useState<
    Array<{ value: string; text: string }>
  >([]);

  React.useEffect(() => {
    client.getIssueTransisions(jiraKey).then((transitions) => {
      setOptions(transitions.map((t) => ({ value: t.id, text: t.name })));
      setSelectValue(transitions.find((t) => t.name === value)?.id);
      setLoadingTransitions(false);
    });
  }, []);

  const updateCardStatus = React.useCallback(
    (newValue: string | number) => {
      setUpdatingStatus(true);
      client
        .updateIssueStatus({ key: jiraKey, transitionId: newValue.toString() })
        .then(() => {
          setUpdatingStatus(false);
        });
    },
    [setUpdatingStatus]
  );
  return (
    <Select
      style={{ width: 140, display: "inline-block" }}
      loading={updatingStatus}
      disabled={loadingTransitions}
      value={selectValue}
      options={options}
      onChange={(newValue) => {
        if (newValue !== undefined) {
          setSelectValue(newValue);
          updateCardStatus(newValue);
        }
      }}
    />
  );
};
