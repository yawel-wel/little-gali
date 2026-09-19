import assert from "node:assert/strict";

const MAX = 255;
const sessionId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const fulfillment = `https://images.littlegali.com/little-gali/fulfillment/${sessionId}/color_image_9`;
const watercolor = `https://images.littlegali.com/little-gali/sessions/${sessionId}/outputs/color/watercolor/${sessionId}_slot9_color_watercolor_v12`;

assert.ok(
  fulfillment.length <= MAX,
  `fulfillment URL ${fulfillment.length} exceeds ${MAX}: ${fulfillment}`,
);
assert.ok(
  watercolor.length <= MAX,
  `session URL ${watercolor.length} exceeds ${MAX}: ${watercolor}`,
);

console.log("storage URL length checks passed", {
  fulfillment: fulfillment.length,
  watercolor: watercolor.length,
});
