export async function goalsFilterApi(params: {
    type?: string
    from?: string
    until?: string
    on?: string
    search?: string
    page?: number
    recurrence?: string
}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
            searchParams.set(key, String(value));
        }
    });

    const res = await fetch(`/api/goalsFilter?${searchParams.toString()}`);

    if (!res.ok) {
        throw new Error("Failed to fetch goals");
    }

    return res.json();
}