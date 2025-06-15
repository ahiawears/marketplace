type SeasonCode = "SS" | "AW" | "Resort" | "Holiday";

export function getCurrentSeason(): { code: string; name: string } {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // "24" for 2024
  const month = now.getMonth() + 1; // 1-12

  if (month >= 2 && month <= 7) {
    return { code: `SS${year}`, name: `Spring/Summer ${20 + year}` };
  } else {
    return { code: `AW${year}`, name: `Autumn/Winter ${20 + year}` };
  }
}

// Optional: Add Resort/Holiday logic (Oct-Dec)
export function getSecondarySeason() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  if (now.getMonth() + 1 >= 11) {
    return { code: `Holiday${year}`, name: `Holiday ${20 + year}` };
  }
  return null;
}

export const generateSeasonOptions = () => {
    const currentYear = new Date().getFullYear();
    const seasons: { code: string; name: string }[] = [];

    const year = (currentYear).toString().slice(-2);
    seasons.push(
        { code: `SS${year}`, name: `Spring/Summer 20${year}` },
        { code: `AW${year}`, name: `Autumn/Winter 20${year}` },
        { code: `Holiday${year}`, name: `Holiday 20${year}` }
    );
  return seasons;
};