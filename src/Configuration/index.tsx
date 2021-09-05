import React from "react";
import { Input, Typography, Button, Icon } from "hero-design";
import Storage, {
  JiraConfig,
  GithubConfig,
  AuthConfiguration,
} from "../Storage";
import { useTheme } from "styled-components";
import JiraConfigContext from "../context/JiraConfigContext";
import GithubConfigContext from "../context/GithubConfigContext";

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
  const [showedSuccess, setShowedSuccess] = React.useState(false);

  React.useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (showedSuccess === true) {
      timerId = setTimeout(() => setShowedSuccess(false), 2000);
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [showedSuccess]);

  const saveToStorage = React.useCallback(() => {
    const authConfig: AuthConfiguration = {
      jiraConfig: jiraConfigFields,
      githubConfig: githubConfigFields,
    };
    Storage.set(authConfig, () => {
      setDirty(false);
      setShowedSuccess(true);
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
          placeholder="Jira host..."
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
          placeholder="Your Jira email..."
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
        }}
      >
        <Button
          type="submit"
          disabled={dirty === false}
          text="Save"
          size="small"
        />
        {showedSuccess && (
          <Typography.Text
            fontSize={12}
            intent="success"
            style={{
              marginLeft: theme.space.xsmall,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Icon
              icon="checkmark"
              style={{
                marginRight: theme.space.xxsmall,
              }}
            />
            Success!
          </Typography.Text>
        )}
      </div>
    </form>
  );
};
