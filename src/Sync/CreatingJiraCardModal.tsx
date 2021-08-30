import { Modal } from "hero-design";
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
  // TODO: Create new jira card
  // Callback to set jira card
  // Inject jira card to PR title
  return (
    <Modal
      open
      title={"Create Jira card"}
      body={"Form"}
      variant="basic"
      size="small"
      onClose={closeModal}
    />
  );
};
