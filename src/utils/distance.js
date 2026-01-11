// Manhattan distance calculation
function calculateDistance(p1, p2) {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

module.exports = calculateDistance;
