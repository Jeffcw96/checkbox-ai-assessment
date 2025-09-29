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
