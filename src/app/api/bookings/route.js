import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Replace this with your actual data fetching logic
    const bookings = [
      {
        id: 1,
        title: "Meeting with Client",
        startTime: "2024-01-15T10:00:00",
        endTime: "2024-01-15T11:30:00"
      },
      {
        id: 2,
        title: "Team Standup",
        startTime: "2024-01-16T09:30:00",
        endTime: "2024-01-16T10:00:00"
      }
    ];

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
} 