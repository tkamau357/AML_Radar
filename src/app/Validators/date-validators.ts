// src/app/Validators/date-validators.ts
export const pastDateOnly = (d: Date | null): boolean => {
    if (!d) return false;
    return d < (new Date());
};

export const dateRange = (d: Date | null): boolean => {
    if (!d) return false;
    return d > (new Date(1689000000)) && d < (new Date());
};