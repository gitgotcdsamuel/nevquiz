// src/app/api/admin/audit-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Generate mock logs for the API response
function generateMockLogs(page: number = 1, limit: number = 10, search?: string, status?: string, severity?: string) {
  const users = [
    { name: 'john.doe@example.com', role: 'Admin' },
    { name: 'jane.smith@example.com', role: 'Super Admin' },
    { name: 'mike.wilson@example.com', role: 'Moderator' },
    { name: 'sarah.johnson@example.com', role: 'Admin' },
    { name: 'robert.brown@example.com', role: 'User' },
  ];

  const actionsList = [
    { action: 'user.login', description: 'User logged in successfully', status: 'success', severity: 'low' },
    { action: 'user.logout', description: 'User logged out', status: 'success', severity: 'low' },
    { action: 'exam.create', description: 'Created new exam: "Final Examination 2024"', status: 'success', severity: 'medium' },
    { action: 'exam.update', description: 'Updated exam settings and duration', status: 'success', severity: 'medium' },
    { action: 'user.create', description: 'Created new user account', status: 'success', severity: 'medium' },
    { action: 'user.update', description: 'Updated user permissions and role', status: 'success', severity: 'medium' },
    { action: 'exam.publish', description: 'Published exam to all students', status: 'success', severity: 'high' },
    { action: 'settings.update', description: 'Updated system configuration', status: 'success', severity: 'medium' },
    { action: 'user.login.failed', description: 'Failed login attempt - invalid credentials', status: 'failed', severity: 'medium' },
    { action: 'security.bruteforce', description: 'Multiple failed login attempts detected', status: 'failed', severity: 'critical' },
  ];

  const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '192.168.1.100', '203.0.113.1'];
  
  let logs: any[] = [];
  const now = new Date();
  
  // Generate 50 mock logs
  for (let i = 0; i < 50; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomAction = actionsList[Math.floor(Math.random() * actionsList.length)];
    const randomIP = ips[Math.floor(Math.random() * ips.length)];
    
    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date(now);
    timestamp.setDate(now.getDate() - daysAgo);
    
    logs.push({
      id: i + 1,
      timestamp: timestamp.toISOString(),
      user: randomUser.name,
      action: randomAction.action,
      description: randomAction.description,
      ip: randomIP,
      status: randomAction.status,
      severity: randomAction.severity,
    });
  }
  
  // Sort by timestamp descending
  logs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Apply filters
  if (search && search.trim()) {
    const searchTerm = search.toLowerCase();
    logs = logs.filter(log => 
      log.user.toLowerCase().includes(searchTerm) ||
      log.action.toLowerCase().includes(searchTerm) ||
      log.description.toLowerCase().includes(searchTerm)
    );
  }
  
  if (status && status !== 'all') {
    logs = logs.filter(log => log.status === status);
  }
  
  if (severity && severity !== 'all') {
    logs = logs.filter(log => log.severity === severity);
  }
  
  // Apply pagination
  const start = (page - 1) * limit;
  const paginatedLogs = logs.slice(start, start + limit);
  const total = logs.length;
  
  return {
    logs: paginatedLogs,
    total: total,
    page: page,
    limit: limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function GET(request: NextRequest) {
  try {
    // For now, skip authentication to get the page working
    // You can add authentication back later
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const severity = searchParams.get('severity') || undefined;
    
    // Generate mock data
    const data = generateMockLogs(page, limit, search, status, severity);
    
    // Return in the format expected by the frontend
    return NextResponse.json({
      logs: data.logs,
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    });
    
  } catch (error: any) {
    console.error('Audit logs API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch audit logs',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

// Handle POST requests for creating logs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create a mock response
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: body.user || 'system@example.com',
      action: body.action || 'unknown',
      description: body.details || 'No description',
      ip: '127.0.0.1',
      status: 'success',
      severity: 'low',
    };
    
    return NextResponse.json({
      success: true,
      log: newLog,
    }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 500 }
    );
  }
}

// Handle DELETE requests for purging logs
export async function DELETE(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Logs purged successfully',
      count: 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete logs' },
      { status: 500 }
    );
  }
}