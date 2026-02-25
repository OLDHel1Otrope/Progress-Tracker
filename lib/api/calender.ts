interface MonthlyStats {
    date: string;
    stats: {
        total_goals: number;
        completed: number;
    };
}

export async function getMonthlyStats({ queryKey }: { queryKey: [string, number, number] }): Promise<MonthlyStats[]> {
    const [, month, year] = queryKey;
    
    const res = await fetch(`/api/stats?year=${year}&month=${month}`);
    
    if (!res.ok) {
        throw new Error("Failed to fetch monthly stats");
    }
    
    return res.json();
}