import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { updates } = await req.json();
    
    console.log('Received updates:', updates);
    
    const updatePromises = updates.map(async ([id, quadrant, position]: [number, number, number]) => {
      console.log(`Updating goal ${id}: quadrant=${quadrant}, position=${position}`);
      
      const result = await db.query(
        'UPDATE goals SET equadrant = $1, eposition = $2 WHERE id = $3 RETURNING *',
        [quadrant, position, id]
      );
      
      return result;
    });
    
    const results = await Promise.all(updatePromises);
    
    return NextResponse.json({ 
      success: true, 
      updated: results.reduce((sum, r) => sum + r.rowCount, 0)
    });
  } catch (error) {
    console.error('Error updating quadrants:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}