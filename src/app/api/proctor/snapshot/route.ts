
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma'; 

export async function POST(request: NextRequest) {
  // 1. Authentication check
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // 2. Parse request body
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const { attemptId, imageBase64, timestamp } = body;

  if (!attemptId || !imageBase64) {
    return NextResponse.json(
      { error: 'Missing required fields: attemptId and imageBase64' },
      { status: 400 }
    );
  }

  // Optional: validate timestamp format (ISO string)
  const snapshotTime = timestamp ? new Date(timestamp) : new Date();
  if (timestamp && isNaN(snapshotTime.getTime())) {
    return NextResponse.json(
      { error: 'Invalid timestamp format' },
      { status: 400 }
    );
  }

  // 3. Basic size validation (prevent abuse)
  // ~1.5 MB base64 string → ~1.1 MB binary JPEG
  const MAX_BASE64_SIZE = 1_500_000; // characters
  if (imageBase64.length > MAX_BASE64_SIZE) {
    return NextResponse.json(
      { error: 'Snapshot too large. Maximum allowed ~1.1 MB after decoding.' },
      { status: 413 }
    );
  }

  try {
    // 4. Fetch the attempt and verify ownership
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        studentId: true,
        examId: true,
        status: true,
        isTerminated: true,
        proctoringData: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Exam attempt not found' }, { status: 404 });
    }

    if (attempt.studentId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to upload snapshots for this attempt' },
        { status: 403 }
      );
    }

    if (attempt.isTerminated) {
      return NextResponse.json(
        { error: 'Cannot upload snapshots — exam attempt has been terminated' },
        { status: 403 }
      );
    }

    if (!['IN_PROGRESS', 'PAUSED'].includes(attempt.status)) {
      return NextResponse.json(
        { error: `Cannot upload snapshots — attempt status is ${attempt.status}` },
        { status: 403 }
      );
    }

    // 5. Append new snapshot entry to proctoringData array
    const currentData = Array.isArray(attempt.proctoringData)
      ? attempt.proctoringData
      : [];

    const newEntry = {
      timestamp: snapshotTime.toISOString(),
      image: imageBase64.startsWith('data:image/')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`,
    };

    const updatedData = [...currentData, newEntry];

    // 6. Update in database
    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        proctoringData: updatedData,
        lastHeartbeat: new Date(), // also update heartbeat on every snapshot
      },
    });

    // Optional: could emit real-time event to admin/lecturer dashboard here
    // (using socket.io, pusher, etc.)

    return NextResponse.json({
      success: true,
      snapshotCount: updatedData.length,
      lastHeartbeat: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Proctor snapshot upload error:', error);

    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      // Prisma record not found
      return NextResponse.json({ error: 'Exam attempt not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to save snapshot' },
      { status: 500 }
    );
  }
}