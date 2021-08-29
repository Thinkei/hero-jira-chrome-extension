import { Empty, Button, Spinner } from "hero-design";
import React from "react";
import { JiraConfig } from "../Storage";
import SyncWithClient from "./SyncWithClient";

export default ({
  goToConfiguration,
  config,
}: {
  goToConfiguration: () => void;
  config: JiraConfig | undefined;
}) => {
  if (
    config !== undefined &&
    config.email !== undefined &&
    config.email !== "" &&
    config.host !== undefined &&
    config.host !== "" &&
    config.token !== undefined &&
    config.token !== ""
  ) {
    return (
      <SyncWithClient
        host={config.host}
        token={config.token}
        email={config.email}
      />
    );
  }

  return (
    <Empty
      text="Missing or not yet configured!"
      extra={
        <Button
          icon="add"
          intent="primary"
          text="Go to Configuration"
          onClick={goToConfiguration}
        />
      }
    />
  );
};
