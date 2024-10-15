import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { BusinessesTable, Business } from '@/lib/db/schema';

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body: Business = await req.json();

    console.log('Received business data:', body); // Debugging line

    await db.insert(BusinessesTable).values(body).execute();
    return NextResponse.json({ message: 'Business added successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error inserting business:', error);
    return NextResponse.json({ error: 'Failed to add business', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
    