import React, { Dispatch, SetStateAction } from "react";
import { Modal, Typography, Input, Select, Button, Spinner } from "hero-design";
import {
	IssueTypeName,
	IssueCreationFields,
	Project,
} from "../JiraClient/types";
import styled from "styled-components";

import createJiraClient from "../JiraClient/createJiraClient";

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
						placeholder="Ticket title"
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
}: {
	onClose: () => void;
	onSubmit: () => void;
	loading: boolean;
}) => {
	return (
		<div>
			<Button variant="text" text="Cancel" onClick={onClose} />
			<Button text="Create" onClick={onSubmit} loading={loading} />
		</div>
	);
};

export default ({
	host,
	token,
	email,
	closeModal,
}: {
	host: string;
	token: string;
	email: string;
	closeModal: () => void;
}) => {
	const [submitting, setSubmitting] = React.useState(false);
	const [loadingProjects, setLoadingProjects] = React.useState(false);
	const [projects, setProjects] = React.useState<Project[]>([]);

	const [formState, setFormState] =
		React.useState<IssueCreationFields>(initialFormState);

	// TODO:
	// Callback to set jira card
	// Inject jira card to PR title

	const client = React.useMemo(() => createJiraClient(host, token, email), []);

	const onSubmit = React.useCallback(() => {
		setSubmitting(true);
		client
			.createIssue(formState)
			.then((response) => client.getIssue(response.key))
			.then(() => {
				closeModal();
				setSubmitting(false);
			});
	}, [formState]);

	React.useEffect(() => {
		setLoadingProjects(true);
		client.getIssueCreateMeta().then((response) => {
			setProjects(response.projects);
			setLoadingProjects(false);
		});
	}, []);

	return (
		<Modal
			open
			title={"Create Jira card"}
			body={
				<Body
					formState={formState}
					setFormState={setFormState}
					projects={projects}
					loading={loadingProjects}
				/>
			}
			footer={
				<Footer loading={submitting} onClose={closeModal} onSubmit={onSubmit} />
			}
			variant="basic"
			size="small"
			onClose={closeModal}
		/>
	);
};
