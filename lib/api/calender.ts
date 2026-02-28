interface MonthlyStats {
    date: string;
    stats: {
        completion_percentage: string;
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

export async function getStats(): Promise<{ date: string, completion_percentage: string }[]> {

    const res = await fetch(`/api/completionData`);

    if (!res.ok) {
        throw new Error("Failed to fetch monthly stats");
    }

    return res.json();
}