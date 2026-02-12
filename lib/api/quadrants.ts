export async function reorderEisenHower(updates: [number, number | null, number][]) {
    const res = await fetch('/api/goals/quadrants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
    });
    return res.json();
}