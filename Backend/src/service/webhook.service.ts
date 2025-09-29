export const handleContractEvent = async (event: any) => {
  switch (event) {
    case "contract.created":
      console.log("create event operation reroute");
      break;
    case "contract.updated":
      console.log("update event operation reroute");
      break;
    case "contract.deleted":
      console.log("delete event operation reroute");
      break;
    case "contract.status_updated":
      console.log("status_updated event operation reroute");
    case "contract.comment_added":
      console.log("comment_added event operation reroute");
    default:
      console.log(`Unknown event operation: ${event}`);
  }
};

export const handleNewMatterCreation = async (matterData: any) => {
  // Logic to create a new matter in the system
  console.log("Creating new matter with data:", matterData);
  // Extract comments and documents field

  const { comments, documents, ...matterDetails } = matterData;

  // Save matterDetails to the database
  // Save comments and documents to their respective tables, linking them to the new matter
};
