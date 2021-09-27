import React from "react";
import { Box, Button, Modal } from "hero-design";

export default () => {
  const [showModal, setShowModal] = React.useState<boolean>(false);
  return (
    <>
      <Box
        bgColor="violet"
        color="white"
        style={{
          width: 70,
          position: "fixed",
          top: "25%",
          right: -25,
          textAlign: "center",
          transform: "rotate(90deg)",
        }}
      >
        <Button
          text="Hero Jira"
          style={{
            padding: 0,
            background: "none",
            height: "auto",
            borderRadius: "unset",
            minWidth: "unset",
          }}
          onClick={() => setShowModal((v) => !v)}
        />
      </Box>
      {showModal && (
        <Modal
          open={showModal}
          title="Hero Jira"
          body={"Modal body"}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
