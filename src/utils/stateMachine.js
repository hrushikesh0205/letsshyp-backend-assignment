const allowedTransitions = {
  CREATED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED"],
};

function canTransition(from, to) {
  return allowedTransitions[from]?.includes(to);
}

module.exports = canTransition;
