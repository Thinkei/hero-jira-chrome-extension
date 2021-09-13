import { Button, Icon, Input, Tooltip, Typography } from "hero-design";
import { useTheme } from "styled-components";
import React from "react";

import GithubConfigContext from "../context/GithubConfigContext";
import JiraConfigContext from "../context/JiraConfigContext";
import Storage, {
  JiraConfig,
  GithubConfig,
  AuthConfiguration,
} from "../Storage";

const useConfigFieldsWithContext = <T,>(
  context: React.Context<T extends JiraConfig | GithubConfig ? T : never>
) => {
  const contextValue = React.useContext(context);
  const [fields, setFields] = React.useState<T>(contextValue);
  const [tokenShown, setTokenShown] = React.useState(false);
  const changeFields = React.useCallback(
    (props: Partial<T>) => setFields((conf) => ({ ...conf, ...props })),
    []
  );
  React.useEffect(() => {
    setFields(contextValue);
  }, [contextValue]);
  return { fields, changeFields, tokenShown, setTokenShown };
};

export default ({
  onSaveConfig,
}: {
  onSaveConfig: (conf: AuthConfiguration) => void;
}) => {
  const {
    fields: jiraConfigFields,
    changeFields: changeJiraConfigFields,
    tokenShown: jiraTokenShown,
    setTokenShown: setJiraTokenShown,
  } = useConfigFieldsWithContext<JiraConfig>(JiraConfigContext);

  const {
    fields: githubConfigFields,
    changeFields: changeGithubConfigFields,
    tokenShown: githubTokenShown,
    setTokenShown: setGithubTokenShown,
  } = useConfigFieldsWithContext<GithubConfig>(GithubConfigContext);

  const [dirty, setDirty] = React.useState<boolean>(false);

  const saveToStorage = React.useCallback(() => {
    const authConfig: AuthConfiguration = {
      jiraConfig: jiraConfigFields,
      githubConfig: githubConfigFields,
    };
    Storage.set(authConfig, () => {
      setDirty(false);
    });
    onSaveConfig(authConfig);
  }, [jiraConfigFields, githubConfigFields]);

  const theme = useTheme();

  const fieldSpacing = {
    marginBottom: theme.space.small,
    display: "block",
  };

  return (
    <form onSubmit={saveToStorage}>
      <Typography.Text
        tagName="label"
        fontWeight="semi-bold"
        style={fieldSpacing}
      >
        Jira host
        <Input
          required
          value={jiraConfigFields.host}
          placeholder="https://employmenthero.atlassian.net"
          onChange={(e) => {
            changeJiraConfigFields({ host: e.target.value });
            setDirty(true);
          }}
        />
      </Typography.Text>
      <Typography.Text
        tagName="label"
        fontWeight="semi-bold"
        style={fieldSpacing}
      >
        Jira email
        <Input
          required
          value={jiraConfigFields.email}
          placeholder="boss@employmenthero.com"
          onChange={(e) => {
            changeJiraConfigFields({ email: e.target.value });
            setDirty(true);
          }}
        />
      </Typography.Text>
      <Typography.Text
        tagName="label"
        fontWeight="semi-bold"
        style={fieldSpacing}
      >
        Jira token
        <Tooltip
          interactive
          content={
            <div>
              Your personal
              <Button.Link
                style={{ marginLeft: theme.space.xsmall }}
                text="Jira token"
                target="_blank"
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
              />
            </div>
          }
          target={
            <Icon
              icon="circle-info"
              style={{
                marginLeft: theme.space.xsmall,
                verticalAlign: "middle",
              }}
            />
          }
        />
        <Input
          required
          value={jiraConfigFields.token}
          placeholder="Jira secret token..."
          onChange={(e) => {
            changeJiraConfigFields({ token: e.target.value });
            setDirty(true);
          }}
          type={jiraTokenShown ? "text" : "password"}
          suffix={
            <Button.Icon
              icon={jiraTokenShown ? "eye-invisible-outlined" : "eye-outlined"}
              onClick={() => setJiraTokenShown((v) => !v)}
            />
          }
        />
      </Typography.Text>
      <Typography.Text
        tagName="label"
        fontWeight="semi-bold"
        style={fieldSpacing}
      >
        Github token
        <Tooltip
          interactive
          content={
            <div>
              Your personal
              <Button.Link
                style={{ marginLeft: theme.space.xsmall }}
                text="Github token"
                target="_blank"
                href="https://github.com/settings/tokens"
              />
            </div>
          }
          target={
            <Icon
              icon="circle-info"
              style={{
                marginLeft: theme.space.xsmall,
                verticalAlign: "middle",
              }}
            />
          }
        />
        <Input
          required
          value={githubConfigFields.token}
          placeholder="Your github secret token"
          onChange={(e) => {
            changeGithubConfigFields({ token: e.target.value });
            setDirty(true);
          }}
          type={githubTokenShown ? "text" : "password"}
          suffix={
            <Button.Icon
              icon={
                githubTokenShown ? "eye-invisible-outlined" : "eye-outlined"
              }
              onClick={() => setGithubTokenShown((v) => !v)}
            />
          }
        />
      </Typography.Text>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: theme.space.medium,
          justifyContent: "flex-end",
        }}
      >
        <Button
          type="submit"
          disabled={dirty === false}
          text="Save"
          size="small"
        />
      </div>
    </form>
  );
};
