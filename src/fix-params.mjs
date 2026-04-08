import fs from 'fs';
import path from 'path';

const files = [
  'src/app/api/exams/code/[code]/route.ts',
  'src/app/api/exams/code/[code]/start/route.ts',
  'src/app/api/exams/code/[code]/submit/route.ts',
  'src/app/api/exams/[id]/archive/route.ts',
  'src/app/api/exams/[id]/attempt/[attemptId]/route.ts',
  'src/app/api/exams/[id]/attempt/[attemptId]/result/route.ts',
  'src/app/api/exams/[id]/attempt/[attemptId]/save/route.ts',
  'src/app/api/exams/[id]/attempt/[attemptId]/submit/route.ts',
  'src/app/api/exams/[id]/attempt/[attemptId]/violation/route.ts',
  'src/app/api/exams/[id]/duplicate/route.ts',
  'src/app/api/exams/[id]/publish/route.ts',
  'src/app/api/exams/[id]/start/route.ts',
];

for (const file of files) {
  const filePath = path.resolve(file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // Fix type annotations: params: { ... } → params: Promise<{ ... }>
  content = content.replace(
    /params: (\{ [^}]+ \}) \}/g,
    'params: Promise<$1> }'
  );

  // Fix destructuring: const { id } = params → const { id } = await params
  // Also handles { id, attemptId } and { examId }
  content = content.replace(
    /const (\{ [^}]+ \}) = params;/g,
    'const $1 = await params;'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('✅ Fixed:', file);
  } else {
    console.log('⚠️  No changes:', file);
  }
}