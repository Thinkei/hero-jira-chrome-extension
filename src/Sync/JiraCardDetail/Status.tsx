import { Tag, Select } from "hero-design";
import React from "react";
import useAxios from "axios-hooks";

import { Transition } from "../../JiraClient/types";

export default ({
  jiraKey,
  currentStatusName,
}: {
  jiraKey: string;
  currentStatusName: string;
}) => {
  const [selectValue, setSelectValue] = React.useState<
    string | number | undefined
  >();

  const [{ data: transitionsData, loading: loadingTransitions }] = useAxios<{
    transitions: Array<Transition>;
  }>(`/rest/api/2/issue/${jiraKey}/transitions`);

  const [{ loading: updatingStatus }, updateStatus] = useAxios<undefined>(
    {
      url: `/rest/api/3/issue/${jiraKey}/transitions`,
      method: "POST",
    },
    { manual: true }
  );

  const options = React.useMemo(
    () =>
      transitionsData?.transitions.map((t) => ({ value: t.id, text: t.name })),
    [transitionsData]
  );

  React.useEffect(() => {
    setSelectValue(
      options?.find((opt) => opt.text === currentStatusName)?.value
    );
  }, [options]);

  return (
    <Select
      style={{ width: 140, display: "inline-block" }}
      loading={updatingStatus}
      disabled={loadingTransitions}
      value={selectValue}
      options={options || []}
      onChange={(newValue) => {
        if (newValue !== undefined) {
          setSelectValue(newValue);
          updateStatus({
            data: {
              transition: { id: newValue },
            },
          });
        }
      }}
    />
  );
};
