export function getUserDesignation(details) {
  return details?.designation || details?.title || "Not specified";
}

export function toUserSummary(row) {
  return {
    id: row.id,
    name: row.name,
    designation: getUserDesignation(row.details),
  };
}
