import React, { Dispatch, SetStateAction } from "react";
import { Modal, Typography, Input, Select, Button, Spinner } from "hero-design";
import useAxios from "axios-hooks";
import styled from "styled-components";
import { Issue, IssueCreationFields, Project } from "../JiraClient/types";

type SelectOptions = { text: string; value: string }[];

const initialFormState: IssueCreationFields = {
  projectId: "",
  summary: "",
  description: "",
  issuetypeId: "",
};

const FieldWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.space.small}px;
`;

const Body = ({
  formState,
  setFormState,
  projects,
  loading,
}: {
  formState: IssueCreationFields;
  setFormState: Dispatch<SetStateAction<IssueCreationFields>>;
  projects: Project[];
  loading: boolean;
}) => {
  const { projectId, summary, description, issuetypeId } = formState;

  const selectedProject: Project | null = React.useMemo(
    () => projects.find(({ id }) => id === projectId) ?? null,
    [projects, projectId]
  );

  const projectOptions: SelectOptions = React.useMemo(
    () =>
      projects.map(({ id, key, name }) => ({
        text: `[${key}] ${name}`,
        value: id,
      })),
    [projects]
  );

  const issueOptions: SelectOptions = React.useMemo(
    () =>
      selectedProject
        ? selectedProject.issuetypes.map(({ id, name }) => ({
            text: name,
            value: id,
          }))
        : [],
    [selectedProject]
  );

  const changeFormValue = React.useCallback(
    (field: Partial<IssueCreationFields>) =>
      setFormState((state) => ({ ...state, ...field })),
    [setFormState]
  );

  const [query, setQuery] = React.useState<string | undefined>("");

  return (
    <Spinner loading={loading}>
      <FieldWrapper>
        <Typography.Text tagName="label" fontWeight="semi-bold">
          Project
          <Select
            value={projectId}
            options={projectOptions}
            onChange={(value) =>
              changeFormValue({ projectId: value ? String(value) : undefined })
            }
            placeholder="Select a project"
            query={query}
            onQueryChange={setQuery}
            loading={loading}
          />
        </Typography.Text>
      </FieldWrapper>
      <FieldWrapper>
        <Typography.Text tagName="label" fontWeight="semi-bold">
          Issue type
          <Select
            value={issuetypeId}
            onChange={(value) =>
              changeFormValue({ issuetypeId: value as string })
            }
            placeholder="Select an issue type"
            options={issueOptions}
            disabled={!projectId}
          />
        </Typography.Text>
      </FieldWrapper>
      <FieldWrapper>
        <Typography.Text tagName="label" fontWeight="semi-bold">
          Title
          <Input
            value={summary}
            onChange={(event) =>
              changeFormValue({ summary: event.target.value })
            }
            placeholder="Ticket summary"
            disabled={!projectId || !issuetypeId}
          />
        </Typography.Text>
      </FieldWrapper>
      <FieldWrapper>
        <Typography.Text tagName="label" fontWeight="semi-bold">
          Description
          <Input.TextArea
            value={description}
            onChange={(event) =>
              changeFormValue({ description: event.target.value })
            }
            placeholder="Ticket description"
            disabled={!projectId || !issuetypeId}
          />
        </Typography.Text>
      </FieldWrapper>
    </Spinner>
  );
};

const Footer = ({
  onClose,
  onSubmit,
  loading,
  formState,
}: {
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  formState: IssueCreationFields;
}) => {
  const { projectId, issuetypeId, summary } = formState;

  return (
    <div>
      <Button variant="text" text="Cancel" onClick={onClose} />
      <Button
        text="Create"
        onClick={onSubmit}
        loading={loading}
        disabled={!projectId || !issuetypeId || !summary}
      />
    </div>
  );
};

export default ({ closeModal }: { closeModal: () => void }) => {
  const [formState, setFormState] =
    React.useState<IssueCreationFields>(initialFormState);

  const [{ data: createdIssue, loading: submitting }, submitIssue] = useAxios<{
    id: string;
    key: string;
  }>(
    {
      url: `/rest/api/2/issue`,
      method: "POST",
    },
    { manual: true }
  );

  const [{ data: projectsData, loading: loadingProjects }] = useAxios<{
    projects: Array<Project>;
  }>("rest/api/2/issue/createmeta");

  React.useEffect(() => {
    if (createdIssue !== undefined) {
      closeModal();
    }
  }, [createdIssue]);

  // TODO:
  // Callback to set jira card
  // Inject jira card to PR title

  const onSubmit = React.useCallback(() => {
    submitIssue({
      data: {
        fields: {
          summary: formState.summary,
          description: formState.description,
          project: { id: formState.projectId },
          issuetype: { id: formState.issuetypeId },
        },
      },
    });
  }, [formState]);

  return (
    <Modal
      open
      title={"Create Jira card"}
      body={
        <Body
          formState={formState}
          setFormState={setFormState}
          projects={projectsData?.projects || []}
          loading={loadingProjects}
        />
      }
      footer={
        <Footer
          loading={submitting}
          onClose={closeModal}
          onSubmit={onSubmit}
          formState={formState}
        />
      }
      variant="basic"
      size="small"
      onClose={closeModal}
    />
  );
};
