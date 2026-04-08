// copy-fixes.js
// Run AFTER fix-remaining.js
// This copies the manually-fixed files to the right locations.
// Run with: node copy-fixes.js

const fs = require("fs");
const path = require("path");

const copies = [
  {
    from: "fixes/code_route.ts",
    to: "src/app/api/exams/code/[code]/route.ts"
  },
  {
    from: "fixes/code_start_route.ts",
    to: "src/app/api/exams/code/[code]/start/route.ts"
  },
  {
    from: "fixes/code_submit_route.ts",
    to: "src/app/api/exams/code/[code]/submit/route.ts"
  },
  {
    from: "fixes/id_attemptId_submit_route.ts",
    to: "src/app/api/exams/[id]/attempt/[attemptId]/submit/route.ts"
  },
  {
    from: "fixes/id_attemptId_result_route.ts",
    to: "src/app/api/exams/[id]/attempt/[attemptId]/result/route.ts"
  },
  {
    from: "fixes/id_attemptId_save_route.ts",
    to: "src/app/api/exams/[id]/attempt/[attemptId]/save/route.ts"
  },
  {
    from: "fixes/id_attemptId_violation_route.ts",
    to: "src/app/api/exams/[id]/attempt/[attemptId]/violation/route.ts"
  },
  {
    from: "fixes/id_publish_route.ts",
    to: "src/app/api/exams/[id]/publish/route.ts"
  },
];

for (const { from, to } of copies) {
  try {
    const content = fs.readFileSync(from, "utf-8");
    fs.writeFileSync(to, content, "utf-8");
    console.log("Copied:", from, "->", to);
  } catch (e) {
    console.error("ERROR copying", from, ":", e.message);
  }
}

console.log("\nAll files copied!");
