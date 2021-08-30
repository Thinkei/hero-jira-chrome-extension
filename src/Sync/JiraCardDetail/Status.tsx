import { Tag, Select } from "hero-design";
import React from "react";

import { IssueStatusName } from "../../JiraClient/types";

export default ({ value }: { value: IssueStatusName }) => {
  const [selectValue, setSelectValue] = React.useState<IssueStatusName>(value);
  const [loading, setLoading] = React.useState<boolean>(false);
  const updateCardStatus = React.useCallback(
    (newValue) => {
      setLoading(true);
    },
    [setLoading]
  );
  return (
    <Select
      style={{ width: 140, display: "inline-block" }}
      loading={loading}
      disabled={loading}
      value={selectValue}
      options={[
        {
          value: "To Do",
          text: "To Do",
        },
        {
          value: "In Progress",
          text: "In Progress",
        },
        { value: "Done", text: "Done" },
      ]}
      onChange={(newValue) => {
        setSelectValue(newValue as IssueStatusName);
        updateCardStatus(newValue as IssueStatusName);
      }}
    />
  );
};
